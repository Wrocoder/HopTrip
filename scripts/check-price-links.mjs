// Public read-only smoke check. Redirects count as technical affiliate clicks.
// HTTP success and expected_price never prove live price or ticket availability.
import {writeFile} from 'node:fs/promises';
const origin='https://hoptrip.pl';
const response=await fetch(origin+'/api/v1/deals?limit=2');
if(!response.ok)throw new Error('Catalogue HTTP '+response.status);
const deals=await response.json(),checks=[];
for(const deal of deals){
 const part=deal.components.find(c=>c.component_type==='FLIGHT'&&c.available&&c.redirect_path);
 if(!part)throw new Error('No flight link for '+deal.slug);
 const first=await fetch(origin+part.redirect_path,{redirect:'manual',signal:AbortSignal.timeout(20000)});
 const partner=new URL(first.headers.get('location'));
 await first.body?.cancel();
 if(first.status!==307||partner.protocol!=='https:'||partner.hostname!=='tp.media')throw new Error('Unexpected partner redirect');
 const intended=new URL(partner.searchParams.get('u'));
 if(intended.protocol!=='https:'||intended.hostname!=='www.aviasales.com'||!intended.pathname.startsWith('/search/'))throw new Error('Unexpected search target');
 const hop=await fetch(partner,{redirect:'manual',signal:AbortSignal.timeout(20000)});
 const target=new URL(hop.headers.get('location'),partner);
 await hop.body?.cancel();
 if(hop.status!==302||target.origin!==intended.origin||target.pathname!==intended.pathname)throw new Error('Search route changed');
 if(target.searchParams.get('currency')!=='pln'||target.searchParams.get('expected_price_currency')!=='pln'||Number(target.searchParams.get('expected_price'))!==Number(deal.flight_price_pln))throw new Error('Cached price/currency parameters changed');
 const landing=await fetch(target,{signal:AbortSignal.timeout(20000)});
 await landing.body?.cancel();
 if(landing.status!==200)throw new Error('Landing HTTP '+landing.status);
 checks.push({slug:deal.slug,origin:deal.origin_code,destination:deal.destination_slug,
  start:deal.trip_start,end:deal.trip_end,cached_price_pln:deal.flight_price_pln,
  observed_at:deal.last_verified_at,expires_at:deal.expires_at,
  statuses:[first.status,hop.status,landing.status],search_path:target.pathname,
  display_currency:'pln',expected_price_matches_cache:true,live_price_verified:false});
}
if(checks.length!==2)throw new Error('Expected two control offers');
const report={checked_at:new Date().toISOString(),note:'Technical redirect check; final seller price and inventory are not verified.',checks};
if(process.argv[2])await writeFile(process.argv[2],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
