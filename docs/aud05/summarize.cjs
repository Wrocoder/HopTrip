const fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const file=path.join(__dirname,'e2e-inventory.json');
// Node unit tests print their own output during unrestricted Playwright discovery.
const raw=fs.readFileSync(file,'utf8');
const start=raw.search(/\{\s*"config"/);
const report=JSON.parse(raw.slice(start,raw.lastIndexOf('}')+1));
fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
const files=fs.readdirSync(path.join(root,'apps/web/tests'));
const apiFiles=fs.readdirSync(path.join(root,'apps/api/tests')).filter(n=>/^test_.*\.py$/.test(n));
const inventory={backendFiles:apiFiles.length,nodeUnitFiles:files.filter(n=>n.endsWith('.test.mjs')).length,playwrightSpecFiles:files.filter(n=>n.endsWith('.spec.ts')).length,
 discoveryErrors:report.errors.map(e=>e.message.replace(/\u001b\[[0-9;]*m/g,'')),discoveredTests:0};
function walk(suites){for(const suite of suites){for(const spec of suite.specs??[])inventory.discoveredTests+=(spec.tests??[]).length;walk(suite.suites??[])}}
walk(report.suites);
fs.writeFileSync(path.join(__dirname,'inventory-summary.json'),JSON.stringify(inventory,null,2)+'\n');
const runtimeFiles=execFileSync('git',['ls-files','apps/web/src','apps/api/app'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/);
const mismatches=runtimeFiles.filter(file=>!fs.readFileSync(path.join(root,file)).equals(fs.readFileSync(path.join(root,'.cache/aud05-isolated',file))));
fs.writeFileSync(path.join(__dirname,'isolation-source-check.json'),JSON.stringify({filesChecked:runtimeFiles.length,mismatches,note:'Runtime source bytes; temporary Next filesystem-root override and test-port substitutions are documented separately.'},null,2)+'\n');
if(mismatches.length)throw new Error('Isolated runtime source differs');
console.log(JSON.stringify(inventory,null,2));
