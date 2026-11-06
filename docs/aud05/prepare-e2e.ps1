# Prepare an isolated copy; no existing servers are reused or stopped.
param([string]$WorkspaceName='aud05-isolated',[switch]$Production)
$ErrorActionPreference='Stop'
$repoRoot=(Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
if($WorkspaceName -notmatch '^aud05-[a-zA-Z0-9_-]+$'){throw 'Use a workspace name beginning with aud05- and no path separators.'}
$copyRoot=Join-Path $repoRoot ".cache/$WorkspaceName"
if(Test-Path -LiteralPath $copyRoot){throw 'Isolated workspace already exists; choose a fresh directory instead of overwriting it.'}
New-Item -ItemType Directory -Path $copyRoot | Out-Null
$trackedFiles=@(git -C $repoRoot ls-files apps/web apps/api)
# Include newly authored runtime/test code before it is committed. Exclude private
# env/JSON/operator files: only these code extensions in source/spec directories.
$newCode=@(git -C $repoRoot ls-files --others --exclude-standard -- apps/api/app apps/web/src apps/web/tests | Where-Object {$_ -match '\.(py|ts|tsx|mjs|css)$'})
$trackedFiles=@(($trackedFiles+$newCode) | Sort-Object -Unique)
foreach($relative in $trackedFiles){
 $source=Join-Path $repoRoot $relative
 $destination=Join-Path $copyRoot $relative
 New-Item -ItemType Directory -Force -Path (Split-Path $destination) | Out-Null
 Copy-Item -LiteralPath $source -Destination $destination
}
# Existing specs use fixed URLs. Change only their test ports in this temporary copy.
$testSources=@(Get-ChildItem (Join-Path $copyRoot 'apps/web/tests') -File -Filter '*.ts')
$testSources+=Get-Item (Join-Path $copyRoot 'apps/web/playwright.config.ts')
$testSources+=Get-Item (Join-Path $copyRoot 'apps/api/tests/e2e_app.py')
foreach($file in $testSources){
 $text=[IO.File]::ReadAllText($file.FullName)
 $text=$text.Replace(':8100',':8125').Replace(':3100',':3125').Replace('--port 8100','--port 8125').Replace('--port 3100','--port 3125')
 [IO.File]::WriteAllText($file.FullName,$text)
}
New-Item -ItemType Junction -Path (Join-Path $copyRoot 'apps/web/node_modules') -Target (Join-Path $repoRoot 'apps/web/node_modules') | Out-Null
# Turbopack requires linked dependencies to be within its filesystem root.
$configPath=Join-Path $copyRoot 'apps/web/next.config.ts'
$rootLiteral=($repoRoot.Replace('\','/') | ConvertTo-Json -Compress)
$configText=[IO.File]::ReadAllText($configPath).Replace('output:"standalone",',"output:`"standalone`",`n turbopack:{root:$rootLiteral},")
[IO.File]::WriteAllText($configPath,$configText)
if($Production){
    $runnerPath=Join-Path $copyRoot 'apps/web/playwright.config.ts'
    $runner=[IO.File]::ReadAllText($runnerPath)
    if(!$runner.Contains('command:"npm run dev --') -or !$runner.Contains('env:{HOPTRIP_API_URL:')){throw 'Unexpected Playwright runner: cannot configure production mode safely.'}
    $runner=$runner.Replace('command:"npm run dev --','command:"npm run start --').Replace('env:{HOPTRIP_API_URL:','env:{NODE_ENV:"production",HOPTRIP_API_URL:')
    [IO.File]::WriteAllText($runnerPath,$runner)
}
Write-Output $copyRoot
