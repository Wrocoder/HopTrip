import {test,expect} from '@playwright/test';

test('winter London trip hydrates without mismatching server text',async({page},testInfo)=>{
 const errors:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error'&&/Hydration failed|hydrated.*(?:match|mismatch)|Minified React error #41[89]/i.test(message.text()))errors.push(message.text());});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const response=await page.goto('/deals/hydration-fixture');
 const serverText=await page.evaluate(html=>new DOMParser().parseFromString(html,'text/html').querySelector('#stay-schedule')?.textContent,await response!.text());
 await expect(page.locator('#budget-start')).toBeEnabled();
 expect(await page.locator('#stay-schedule').textContent()).toBe(serverText);
 await expect(page.locator('#stay-schedule')).toContainText('15:05 GMT (Europe/London)');
 await page.locator('#stay-schedule > summary').click();
 await expect(page.locator('#trip-events button[type="submit"]')).toBeEnabled();
 const updated=page.waitForResponse(response=>response.url().includes('/hydration-fixture/events?')&&new URL(response.url()).searchParams.get('end_date')==='2027-01-12');
 await page.locator('#stay-checkout').fill('2027-01-12');
 await updated;await expect(page.locator('#trip-events button[type="submit"]')).toBeEnabled();
 await expect(page.locator('#budget-nights')).toHaveValue('4');
 await expect(page.locator('#trip-events').getByLabel('Do',{exact:true})).toHaveValue('2027-01-12');
 await page.reload();await expect(page.locator('#stay-checkout')).toHaveValue('2027-01-12');
 await testInfo.attach('hydration-errors',{body:JSON.stringify(errors,null,2),contentType:'application/json'});
 expect(errors).toEqual([]);
});
