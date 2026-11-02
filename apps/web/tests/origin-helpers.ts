import {expect,type Page} from '@playwright/test';

export async function chooseOrigin(page:Page,code:string){
 const input=page.locator('#home-origin');
 await input.fill(code);
 if(code){await input.press('ArrowDown');await input.press('Enter');}
 else await input.press('Tab');
 await expect.poll(()=>new URL(page.url()).searchParams.get('origin'),{timeout:15000}).toBe(code);
 await expect.poll(async()=>(await page.context().cookies()).find(c=>c.name==='hoptrip.origin.v1')?.value,{timeout:15000}).toBe(code || undefined);
}
