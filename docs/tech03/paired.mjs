import fs from 'node:fs';
import vm from 'node:vm';
import {performance} from 'node:perf_hooks';
import ts from '../../apps/web/node_modules/typescript/lib/typescript.js';
import * as cities from '../../apps/web/src/lib/cities.ts';
import * as config from '../../apps/web/src/lib/i18n/config.ts';
import {airportSuggestions} from '../../apps/web/src/lib/airports.ts';
import {destinationSuggestions} from '../../apps/web/src/lib/destinations.ts';
function old(file){
 const loaded={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name=>({'./cities.ts':cities,'./i18n/config.ts':config})[name],loaded,loaded.exports);
 return loaded.exports;
}
const legacy=[old('./airports-before.txt').airportSuggestions,old('./destinations-before.txt').destinationSuggestions];
const rows=[];
for(const [index,current] of [airportSuggestions,destinationSuggestions].entries())for(const query of ['','test','missing']){
 const records=Array.from({length:500},(_,id)=>({id,iata_code:'TST',name:'Test-only airport',city:'Test-only city',country:'Test-only',country_code:'XX',slug:`test-only-${id}`,is_active:id%7!==0}));
 const functions=[legacy[index],current],samples=[[],[]];
 for(const fn of functions)for(let j=0;j<3;j++)fn(records,query);
 for(let batch=0;batch<5;batch++)for(const which of batch%2?[1,0]:[0,1]){
  const start=performance.now();for(let j=0;j<3;j++)functions[which](records,query);samples[which].push(performance.now()-start);
 }
 const medians=samples.map(a=>[...a].sort((a,b)=>a-b)[2]);
 const same=JSON.stringify(functions[0](records,query).map(x=>x.id))===JSON.stringify(current(records,query).map(x=>x.id));
 rows.push({kind:index?'destination':'airport',query,samples,beforeMs:medians[0],afterMs:medians[1],ratio:medians[0]/medians[1],same});
}
fs.writeFileSync(new URL('./paired.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),node:process.version,method:'same process; 3 warmups each; 5 alternating batches of 3 operations; median batch ms; 500 synthetic rows',rows},null,2));
if(rows.some(r=>!r.same))process.exitCode=1;
