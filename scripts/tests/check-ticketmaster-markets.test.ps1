$ErrorActionPreference = 'Stop'
$marketTestState = [pscustomobject]@{Calls=0;Fail=$false}
$fixtureDirectory = Join-Path ([IO.Path]::GetTempPath()) ('hoptrip-market-test-' + [guid]::NewGuid())
New-Item -ItemType Directory -Path $fixtureDirectory | Out-Null
$keyPath = Join-Path $fixtureDirectory 'fixture-key.txt'
$outputPath = Join-Path $fixtureDirectory 'report.json'
Set-Content -LiteralPath $keyPath -Value 'fixture-secret-never-print'

class FixtureAccessError : System.Exception {
    [object] $Response
    FixtureAccessError() : base('fixture-secret-never-print') {
        $this.Response = [pscustomobject]@{ StatusCode = 429 }
    }
}

function Invoke-RestMethod {
    param($Uri, $TimeoutSec)
    if ($Uri -like '*/destinations') {
        return @([pscustomobject]@{country_code='FR';country='France';city='Paris'},
                 [pscustomobject]@{country_code='GB';country='UK';city='London'})
    }
    if ($Uri -like '*/airports') { return @([pscustomobject]@{country_code='PL';iata_code='WRO'}) }
    return [pscustomobject]@{total=0;items=@()}
}

function Invoke-WebRequest {
    param($Uri, [switch]$UseBasicParsing, $TimeoutSec, $MaximumRedirection)
    if ($MaximumRedirection -ne 0) { throw 'Redirects must be disabled' }
    $marketTestState.Calls++
    if ($marketTestState.Fail) { throw [FixtureAccessError]::new() }
    $country = if ($Uri -match 'countryCode=([A-Z]{2})') { $Matches[1] } else { throw 'Missing country' }
    return [pscustomobject]@{StatusCode=200;Content=(ConvertTo-Json -Depth 8 -Compress @{
        page=@{totalElements=1};_embedded=@{events=@(@{
            url='https://ticketmaster.evyy.net/c/7853869/123/456?u=fixture';
            _embedded=@{venues=@(@{country=@{countryCode=$country}})}
        })}
    })}
}
function Start-Sleep { param($Milliseconds) }

try {
    foreach ($fail in @($false, $true)) {
        $marketTestState.Fail=$fail
        $marketTestState.Calls=0
        $output = & "$PSScriptRoot/../check-ticketmaster-markets.ps1" -KeyPath $keyPath -OutputPath $outputPath | Out-String
        $json = Get-Content -LiteralPath $outputPath -Raw
        $report = $json | ConvertFrom-Json
        if (($output+$json).Contains('fixture-secret-never-print')) { throw 'Credential leaked' }
        if ($fail) {
            if ($marketTestState.Calls -ne 1 -or !$report.stoppedOnAccessOrRateLimit) { throw 'Provider failure did not stop requests' }
            if ($report.countries[1].trackingStatus -ne 'NOT_CHECKED') { throw 'Unqueried market was marked checked' }
        } elseif ($marketTestState.Calls -ne 2 -or $report.countries[0].trackingStatus -ne 'TRACKED_SAMPLE') {
            throw ('Country sample was not summarized correctly: calls=' + $marketTestState.Calls + ', status=' + $report.countries[0].trackingStatus)
        }
    }
    'Market script: sample, rate-limit stop, no redirects and credential redaction passed'
} finally {
    Remove-Item -LiteralPath $keyPath, $outputPath -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $fixtureDirectory -ErrorAction SilentlyContinue
}
