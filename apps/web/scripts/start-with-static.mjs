import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {retainStatic} from './retain-static.mjs';
import {readFile} from 'node:fs/promises';

if(process.env.HOPTRIP_STATIC_VOLUME_REQUIRED==='1'){
 let mounted=false;try{mounted=(await readFile('/proc/self/mountinfo','utf8')).split('\n').some(line=>line.split(' ')[4]===path.resolve('.next/static'));}catch{}
 if(!mounted)throw Error('Production requires the retained static volume; update the deployer and apply docker-compose.static-cache.yml');
}
// Compose may mount an empty cache on first startup. Publish the baked seed first.
await retainStatic([path.resolve('static-seed')],path.resolve('.next/static'));
await import(pathToFileURL(path.resolve('server.js')).href);
