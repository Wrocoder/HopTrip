param([string]$WorkspaceName='sec01-docker-probe')
$ErrorActionPreference='Stop'
if($WorkspaceName -notmatch '^sec01-[a-zA-Z0-9_-]+$'){throw 'Use a sec01- workspace name without path separators.'}
$repo=(Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$workspace=Join-Path $repo ".cache/$WorkspaceName"
if(Test-Path -LiteralPath $workspace){throw 'Choose a fresh workspace; no existing files will be removed.'}
New-Item -ItemType Directory -Path $workspace | Out-Null
$results=@()
$canaries=@('.env','.env.production','nested/.env.local','monitor.env','operator.json','nested/operator.json','.cache/private.txt','.worktrees/private.txt','.idea/private.txt')
foreach($kind in @('root','web')){
 foreach($stage in @('before','after')){
  $name="$kind-$stage"
  $context=Join-Path $workspace "$name-context"
  $export=Join-Path $workspace "$name-export"
  New-Item -ItemType Directory -Path $context | Out-Null
  foreach($relative in ($canaries+@('safe.txt','tests/fixtures/operator.json'))){
   $file=Join-Path $context $relative
   New-Item -ItemType Directory -Force -Path (Split-Path $file) | Out-Null
   [IO.File]::WriteAllText($file,'SEC01 synthetic canary; no real secret')
  }
  [IO.File]::WriteAllText((Join-Path $context 'Dockerfile'),"FROM scratch`nCOPY . /`n")
  $ignorePath=if($kind -eq 'root'){'.dockerignore'}else{'apps/web/.dockerignore'}
  $ignore=if($stage -eq 'before'){(git -C $repo show "HEAD:$ignorePath") -join "`n"}else{[IO.File]::ReadAllText((Join-Path $repo $ignorePath))}
  [IO.File]::WriteAllText((Join-Path $context '.dockerignore'),$ignore)
  docker build --quiet --output "type=local,dest=$export" $context *> (Join-Path $workspace "$name-build.txt")
  if($LASTEXITCODE -ne 0){throw "Scratch context probe failed: $name"}
  $leaked=@($canaries|Where-Object {Test-Path -LiteralPath (Join-Path $export $_)})
  if(!(Test-Path -LiteralPath (Join-Path $export 'safe.txt'))){throw 'Probe did not export the safe file'}
  if($stage -eq 'after' -and $leaked.Count){throw "Unexpected canaries in final $kind context: $leaked"}
  $fixture=Test-Path -LiteralPath (Join-Path $export 'tests/fixtures/operator.json')
  if($kind -eq 'web' -and $stage -eq 'after' -and !$fixture){throw 'Public operator test fixture was unintentionally excluded'}
  $results+=[pscustomobject][ordered]@{context=$kind;stage=$stage;exportedCanaries=$leaked;safeFile=$true;publicFixtureIncluded=$fixture}
 }
}
$results|ConvertTo-Json -Depth 5|Set-Content -LiteralPath (Join-Path $PSScriptRoot 'docker-context.json') -Encoding utf8
$results|Format-Table context,stage,@{Name='Exported canaries';Expression={$_.exportedCanaries -join ', '}}
