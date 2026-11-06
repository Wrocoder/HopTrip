import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import config from '../playwright.config';

test.skip(!process.env.HOPTRIP_STATIC_MANIFEST||process.env.HOPTRIP_H3_PRODUCTION!=='1','Requires explicitly prepared retained static cache.');
test('previous and current release resources survive switching server generations',async({request},info)=>{
 test.setTimeout(120000);
 const servers=config.webServer;if(!Array.isArray(servers))throw Error('Expected fixture servers');
 expect(servers[1].command).toContain('npm run start --');expect(servers[1].env?.NODE_ENV).toBe('production');
 const build=readFileSync('.next/BUILD_ID','utf8').trim();expect(await(await request.get('/deals')).text()).toContain(build);
 const result=JSON.parse(execFileSync(process.execPath,[path.resolve('scripts/check-static.mjs'),String(info.project.use.baseURL),process.env.HOPTRIP_STATIC_MANIFEST!,process.env.HOPTRIP_PREVIOUS_HTML!,'--image-build'],{encoding:'utf8',windowsHide:true}));
 expect(result.checked).toBeGreaterThan(0);
 writeFileSync(info.outputPath('retained-static.json'),JSON.stringify({build,...result},null,2));
});
