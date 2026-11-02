import {performance} from 'node:perf_hooks';
import {writeFileSync} from 'node:fs';
import os from 'node:os';
import {airportSuggestions} from '../../apps/web/src/lib/airports.ts';
import {destinationSuggestions} from '../../apps/web/src/lib/destinations.ts';

// Synthetic registries for local CPU measurement, never product offers/data.
const result={at:new Date().toISOString(),node:process.version,cpu:os.cpus()[0].model,method:'7 batches x 10 operations after 10 warmup operations; median batch ms',cases:[]};
for(const count of [4,500])for(const kind of ['airport','destination'])for(const query of ['', 'test', 'missing']){
 const records=Array.from({length:count},(_,id)=>({id,iata_code:'TST',name:'Test-only airport',city:'Test-only city',country:'Test-only',country_code:'XX',slug:`test-only-${id}`,is_active:id%7!==0}));
 const search=kind==='airport'?airportSuggestions:destinationSuggestions;
 for(let i=0;i<10;i++)search(records,query);
 const samples=[];for(let batch=0;batch<7;batch++){const start=performance.now();for(let i=0;i<10;i++)search(records,query);samples.push(performance.now()-start);}
 result.cases.push({count,kind,query,ids:search(records,query).map(x=>x.id),samples,median:[...samples].sort((a,b)=>a-b)[3]});
}
writeFileSync(process.argv[2],JSON.stringify(result,null,2));

