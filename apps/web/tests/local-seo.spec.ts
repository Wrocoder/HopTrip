import {test} from '@playwright/test';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {writeFile} from 'node:fs/promises';
test('full local SEO audit against the published page inventory',async({},testInfo)=>{
 test.skip(testInfo.project.name!=='desktop','SEO is independent of viewport');
 test.setTimeout(300000);
 try {
  const {stdout}=await promisify(execFile)(process.execPath,['scripts/audit-seo.mjs','http://127.0.0.1:3100','http://127.0.0.1:3100'],{env:process.env,maxBuffer:4*1024*1024});
  await writeFile('landings-seo-verified.log',stdout);
 } catch(error) {
  const failure=error as Error & {stdout?:string};
  await writeFile('landings-seo-verified.log',failure.stdout??failure.message);
  throw error;
 }
});
