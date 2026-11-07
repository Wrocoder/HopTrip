[CmdletBinding()]
param(
 [Parameter(Mandatory)][string]$BeforeZip,
 [Parameter(Mandatory)][string]$AfterZip,
 [Parameter(Mandatory)][string]$OutputPath
)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$culture=[Globalization.CultureInfo]::InvariantCulture

function Read-SearchExport([string]$archivePath) {
 $archive=[IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $archivePath))
 $tables=@{}
 try {
  foreach($entry in $archive.Entries) {
   if($entry.Name -notlike '*.csv'){continue}
   $reader=[IO.StreamReader]::new($entry.Open(),[Text.Encoding]::UTF8)
   try {$rows=@($reader.ReadToEnd() | ConvertFrom-Csv)} finally {$reader.Dispose()}
   $tables[$entry.Name]=$rows
  }
 } finally {$archive.Dispose()}
 $chartName=@('Диаграмма.csv','Chart.csv') | Where-Object {$tables.ContainsKey($_)} | Select-Object -First 1
 if(!$chartName){throw 'A Russian or English Search Console Chart CSV is required.'}
 $days=@($tables[$chartName]);if(!$days.Count){throw 'The chart has no daily rows.'}
 $clicks=0L;$impressions=0L;$weightedPosition=0.0;$dates=@()
 foreach($row in $days) {
  $values=@($row.PSObject.Properties.Value)
  if($values.Count -ne 5){throw 'Expected daily Date, Clicks, Impressions, CTR, Position columns.'}
  $date=[DateTime]::ParseExact($values[0],'yyyy-MM-dd',$culture)
  $dayClicks=[long]::Parse($values[1],$culture);$dayImpressions=[long]::Parse($values[2],$culture)
  if($dayClicks -lt 0 -or $dayImpressions -lt 0){throw 'Negative Search Console values.'}
  if($dayImpressions -gt 0){$weightedPosition += [double]::Parse($values[4],$culture)*$dayImpressions}
  $dates+=$date;$clicks+=$dayClicks;$impressions+=$dayImpressions
 }
 $ordered=@($dates | Sort-Object)
 if(@($dates | Sort-Object -Unique).Count -ne $dates.Count){throw 'Duplicate daily rows.'}
 if(($ordered[-1]-$ordered[0]).Days+1 -ne $dates.Count){throw 'The date range has gaps.'}
 $breakdowns=[ordered]@{}
 foreach($category in @(@('pages','Страницы.csv','Pages.csv'),@('queries','Запросы.csv','Queries.csv'),@('countries','Страны.csv','Countries.csv'),@('devices','Устройства.csv','Devices.csv'))) {
  $name=@($category[1],$category[2])|Where-Object {$tables.ContainsKey($_)}|Select-Object -First 1
  if(!$name){continue}
  $categoryClicks=0L;$categoryImpressions=0L
  foreach($row in @($tables[$name])){$values=@($row.PSObject.Properties.Value);$categoryClicks += [long]::Parse($values[1],$culture);$categoryImpressions += [long]::Parse($values[2],$culture)}
  $breakdowns[$category[0]]=[ordered]@{rows=@($tables[$name]).Count;clicks=$categoryClicks;impressions=$categoryImpressions}
 }
 return [ordered]@{start=$ordered[0].ToString('yyyy-MM-dd');end=$ordered[-1].ToString('yyyy-MM-dd');days=$days.Count;clicks=$clicks;impressions=$impressions;ctr=if($impressions){$clicks/$impressions}else{$null};averagePosition=if($impressions){$weightedPosition/$impressions}else{$null};breakdowns=$breakdowns}
}

$before=Read-SearchExport $BeforeZip;$after=Read-SearchExport $AfterZip
$sameLength=$before.days -eq $after.days
$nonOverlapping=[DateTime]::ParseExact($after.start,'yyyy-MM-dd',$culture) -gt [DateTime]::ParseExact($before.end,'yyyy-MM-dd',$culture)
$report=[ordered]@{
 schema='hoptrip-gsc-comparison-v1';generatedAt=[DateTime]::UtcNow.ToString('o');before=$before;after=$after
 comparison=[ordered]@{sameWindowLength=$sameLength;afterFollowsBefore=$nonOverlapping;eligibleForWindowComparison=($sameLength -and $nonOverlapping);clickDelta=($after.clicks-$before.clicks);impressionDelta=($after.impressions-$before.impressions)}
 limitations=@('This is an aggregate comparison, not proof of a causal SEO effect.','Chart totals are property aggregates; page totals use a different grouping.','Queries may be hidden; do not infer missing queries or join unrelated breakdowns.','Verify matching search type, country/device filters, recrawl date and seasonality before interpreting changes.','Dates follow the export; this script cannot verify Google-selected canonicals or field Core Web Vitals.')
}
$destination=[IO.Path]::GetFullPath($OutputPath)
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destination))|Out-Null
$report|ConvertTo-Json -Depth 9|Set-Content -LiteralPath $destination -Encoding utf8
Write-Output "Saved comparison: $destination"
