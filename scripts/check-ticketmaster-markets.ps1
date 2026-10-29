param(
    [string]$KeyPath = "$env:USERPROFILE\.hoptrip\ticketmaster.txt",
    [string]$OutputPath = "$PSScriptRoot\..\.cache\ticketmaster-markets-audit.json",
    [string]$AffiliateId = '7853869'
)

$ErrorActionPreference = 'Stop'
# Never print the key, request URI, raw API response, or exception message.
$apiKey = (Get-Content -LiteralPath $KeyPath -Raw).Trim()
if (!$apiKey) { throw 'Ticketmaster key file is empty.' }
$destinations = Invoke-RestMethod 'https://hoptrip.pl/api/v1/destinations' -TimeoutSec 30
$airports = Invoke-RestMethod 'https://hoptrip.pl/api/v1/airports' -TimeoutSec 30
$polishOrigins = @($airports | Where-Object country_code -eq 'PL' | ForEach-Object iata_code)
$deals = @()
$complete = $false
for ($offset = 0; $offset -le 10000; $offset += 100) {
    $page = Invoke-RestMethod "https://hoptrip.pl/api/v1/deals?limit=100&offset=$offset&include_total=true" -TimeoutSec 30
    $deals += @($page.items)
    if ($offset + 100 -ge $page.total) { $complete = $true; break }
}
$deals = @($deals | Sort-Object id -Unique | Where-Object { $_.origin_code -in $polishOrigins })
$countries = @($destinations | Group-Object country_code | Sort-Object Name)
$rows = @()
$stopped = $false
$fromUtc = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
foreach ($country in $countries) {
    $code = $country.Name
    if ($code -notmatch '^[A-Z]{2}$') { throw 'Invalid catalog country code.' }
    $countryDeals = @($deals | Where-Object destination_country_code -eq $code)
    $row = [ordered]@{
        countryCode = $code
        countryName = $country.Group[0].country
        catalogCities = @($country.Group.city | Sort-Object -Unique)
        currentDealsFromPoland = $countryDeals.Count
        currentDealCities = @($countryDeals.destination_city | Sort-Object -Unique)
        httpStatus = $null
        totalFutureEvents = $null
        sampledEvents = 0
        matchingCountryEvents = 0
        affiliateLinks = 0
        linkHosts = @()
        trackingStatus = 'NOT_CHECKED'
    }
    if (!$stopped) {
        $requestUri = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=' + [uri]::EscapeDataString($apiKey) + '&countryCode=' + $code + '&size=3&sort=date,asc&startDateTime=' + [uri]::EscapeDataString($fromUtc)
        try {
            $response = Invoke-WebRequest -Uri $requestUri -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 0
            $body = $response.Content | ConvertFrom-Json
            $events = @($body._embedded.events | Where-Object { $null -ne $_ })
            $row.httpStatus = [int]$response.StatusCode
            $row.totalFutureEvents = $body.page.totalElements
            $row.sampledEvents = $events.Count
            $hosts = @()
            foreach ($event in $events) {
                $venueCountries = @($event._embedded.venues | ForEach-Object { $_.country.countryCode })
                if ($code -in $venueCountries) { $row.matchingCountryEvents++ }
                $link = $null
                if ([uri]::TryCreate([string]$event.url, [UriKind]::Absolute, [ref]$link)) {
                    $hosts += $link.Host
                    if ($link.Scheme -eq 'https' -and $link.Host -eq 'ticketmaster.evyy.net' -and $link.AbsolutePath -match ('^/c/' + [regex]::Escape($AffiliateId) + '/')) { $row.affiliateLinks++ }
                }
            }
            $row.linkHosts = @($hosts | Sort-Object -Unique)
            $row.trackingStatus = if (!$events.Count) { 'NO_EVENTS_IN_QUERY' } elseif ($row.matchingCountryEvents -ne $events.Count) { 'COUNTRY_MISMATCH' } elseif ($row.affiliateLinks -eq $events.Count) { 'TRACKED_SAMPLE' } elseif ($row.affiliateLinks -gt 0) { 'PARTIALLY_TRACKED_SAMPLE' } else { 'NO_TRACKING_IN_SAMPLE' }
        } catch {
            $row.trackingStatus = 'REQUEST_FAILED'
            if ($_.Exception.Response) { $row.httpStatus = [int]$_.Exception.Response.StatusCode }
            if ($row.httpStatus -in @(401, 403, 429)) { $stopped = $true }
        }
        Start-Sleep -Milliseconds 1100
    }
    $rows += [pscustomobject]$row
    Write-Output "$code : $($row.trackingStatus), events=$($row.totalFutureEvents), deals=$($row.currentDealsFromPoland)"
}
$report = [ordered]@{
    checkedAtUtc = [DateTime]::UtcNow.ToString('o')
    eventStartFromUtc = $fromUtc
    catalogSource = 'https://hoptrip.pl/api/v1/destinations'
    dealsPaginationComplete = $complete
    currentDealsFromPoland = $deals.Count
    affiliateId = $AffiliateId
    sampleSizePerCountry = 3
    stoppedOnAccessOrRateLimit = $stopped
    limitations = 'Country-level sample, not city/date coverage or commission verification. Tracking counts check only publisher host/path; use the adapter smoke check for full URL validation. Empty results do not prove an unsupported market. Catalog/deal pages are not an atomic snapshot. No redirects were followed.'
    countries = $rows
}
$outputDirectory = Split-Path -Parent ([IO.Path]::GetFullPath($OutputPath))
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputPath -Encoding utf8
