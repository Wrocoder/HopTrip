import {test,expect} from '@playwright/test';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

// Opt-in lab measurement on a local production build. Never download tools from a test.
for(const path of ['/','/deals'])for(const device of ['mobile','desktop'])test(`H3 Lighthouse ${path} ${device}`,async({},info)=>{
 const cli=process.env.HOPTRIP_LIGHTHOUSE_CLI;
 test.skip(!cli||info.project.name!=='desktop','Requires an explicitly supplied Lighthouse CLI and local production server.');
 test.setTimeout(180000);
 const base=new URL(String(info.project.use.baseURL));
 expect(['127.0.0.1','localhost']).toContain(base.hostname);
 expect(process.env.HOPTRIP_H3_PRODUCTION).toBe('1');
 const output=info.outputPath('lighthouse.json');
 const result=spawnSync(process.execPath,[cli!,new URL(path,base).href,
  '--chrome-flags=--headless --disable-background-networking',
  '--only-categories=performance,accessibility,best-practices,seo',
  '--output=json',`--output-path=${output}`,'--no-enable-error-reporting',
  '--disable-full-page-screenshot','--quiet','--blocked-url-patterns=https://*',
  ...(device==='desktop'?['--preset=desktop']:[])],{encoding:'utf8',timeout:150000,windowsHide:true});
 expect(result.error,String(result.stderr)).toBeUndefined();
 expect(result.status,String(result.stderr)).toBe(0);
 const report=JSON.parse(readFileSync(output,'utf8'));
 await info.attach('lighthouse',{path:output,contentType:'application/json'});
 expect(report.runtimeError).toBeUndefined();
 // Scores are recorded, not treated as evidence of real-user CWV or a passing release gate.
});
