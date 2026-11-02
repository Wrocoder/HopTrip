import {expect,type Locator} from '@playwright/test';

/** Native popups can bypass browser routing; contain them before the click. */
export async function localOutbound(link:Locator,kind:'synthetic'|'stay'|'stay22'|'ticket'='synthetic'){
 const original=await link.getAttribute('href');
 expect(original).toMatch(/^https:\/\//);
 const local=new URL('/__test__/grow03-external',process.env.NEXT_PUBLIC_API_URL??'http://127.0.0.1:8100');
 expect(['localhost','127.0.0.1','[::1]']).toContain(local.hostname);
 local.searchParams.set('kind',kind);
 await link.evaluate((node,href)=>{(node as HTMLAnchorElement).href=href;},local.href);
 return async()=>link.evaluate((node,href)=>node.setAttribute('href',href),original!);
}
