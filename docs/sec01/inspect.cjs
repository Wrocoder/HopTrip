// Evidence collection only: matched credential values are never emitted.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'../..');
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const rules=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],['github-token',/\b(?:ghp|gho|ghs|ghu)_[A-Za-z0-9]{36,}\b/],['aws-access-key',/\bAKIA[A-Z0-9]{16}\b/],['slack-token',/\bxox[baprs]-[A-Za-z0-9-]{20,}\b/]];
const findings=[];let scanned=0;
for(const file of files){const bytes=fs.readFileSync(path.join(root,file));if(bytes.includes(0))continue;scanned++;const lines=bytes.toString('utf8').split(/\r?\n/);for(let i=0;i<lines.length;i++)for(const [rule,re]of rules)if(re.test(lines[i]))findings.push({file,line:i+1,rule});}
fs.writeFileSync(path.join(__dirname,'secret-patterns.json'),JSON.stringify({at:new Date().toISOString(),scannedTextFiles:scanned,findings,limitations:'Selected high-confidence formats only, current nonignored working tree. No private env files, process environment, deleted/history objects or external secret stores scanned. Values never emitted.'},null,2)+'\n');
const deps=createRequire(path.join(root,'apps/web/package.json'));
(async()=>{const browser=await deps('@playwright/test').chromium.launch({channel:'chrome'}),page=await browser.newPage();const data={at:new Date().toISOString(),base:'https://hoptrip.pl',pages:[]};
 try{for(const route of ['/','/deals','/api/v1/alerts/status','/api/v1/editor/','/api/v1/admin/system/status']){let observed=null;const listener=response=>{if(response.request().isNavigationRequest())observed=response};page.on('response',listener);let error=null;try{observed=await page.goto(data.base+route)}catch(caught){error=caught.message.split('\n')[0]}finally{page.off('response',listener)}const headers=observed?.headers()??{};data.pages.push({route,status:observed?.status()??null,navigationError:error,headers:Object.fromEntries(['content-security-policy','content-security-policy-report-only','x-frame-options','x-content-type-options','referrer-policy','strict-transport-security','cache-control'].map(k=>[k,headers[k]??null]))});}}
 finally{await browser.close();fs.writeFileSync(path.join(__dirname,'public-headers.json'),JSON.stringify(data,null,2)+'\n');}
 console.log(JSON.stringify({scanned,secretPatternFindings:findings.length,publicPages:data.pages.map(p=>({route:p.route,status:p.status,csp:!!p.headers['content-security-policy']}))},null,2));
})().catch(error=>{console.error(error.message);process.exitCode=1});
