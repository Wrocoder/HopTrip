import {defineConfig} from '@playwright/test';
import base from './playwright.config';

const servers=base.webServer;
if(!Array.isArray(servers)||servers.length!==2)throw new Error('Isolated local API and web servers required');
// Build first with the same loopback NEXT_PUBLIC_* values; never reuse a live server.
export default defineConfig({...base,webServer:[servers[0],{...servers[1],
 command:'npm run start -- --hostname 127.0.0.1 --port 3100',
 env:{...servers[1].env,NODE_ENV:'production'},
}]});
