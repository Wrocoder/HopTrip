import {defineConfig} from '@playwright/test';
import base from './playwright.config';
import path from 'node:path';

const servers=base.webServer;
if(!Array.isArray(servers)||servers.length!==2)throw new Error('Isolated servers required');
export default defineConfig({...base,webServer:[
 {...servers[0],command:`"${process.env.HOPTRIP_TEST_PYTHON}" -m uvicorn api_trace:app --app-dir ../../docs/v5-release-20261110 --host 127.0.0.1 --port 8100 --no-access-log`,
  env:{...servers[0].env,HOPTRIP_API_PROBE_LOG:path.resolve('../../docs/v5-release-20261110/api.jsonl')}},
 {...servers[1],command:'npm run start -- --hostname 127.0.0.1 --port 3100',
  env:{...servers[1].env,NODE_ENV:'production',HOPTRIP_FETCH_PROBE:'1',HOPTRIP_FETCH_PROBE_LOG:path.resolve('../../docs/v5-release-20261110/web.jsonl'),
   NODE_OPTIONS:`--require=${path.resolve('../../docs/v5-release-20261110/fetch-probe.cjs')}`}},
]});
