import {test,expect} from '@playwright/test';
import {localizedHref} from '../src/lib/i18n/routing';
import {getMessages} from '../src/lib/i18n/messages';
const fixture='http://127.0.0.1:8100';
test.afterEach(async({request})=>{await request.post(`${fixture}/__test__/flight-link-binding?scenario=reset`);});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: stale ticket and contradictory dates disable booking`,async({page,request})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 expect((await request.post(`${fixture}/__test__/flight-link-binding?scenario=valid`)).ok()).toBe(true);
 await page.goto(localizedHref('/deals/browser-13',locale));
 await expect(page.locator('.booking-card a.cta')).toHaveCount(1);
 const valid=await request.get(`${fixture}/go/browser-13/flight`,{maxRedirects:0,headers:{'x-hoptrip-fixture-original-redirect':'1'}});
 expect(valid.status()).toBe(307);
 const target=new URL(valid.headers().location);
 expect(target.origin).toBe('https://tp.media');expect(target.searchParams.get('marker')).toBe('123');
 expect(target.searchParams.get('trs')).toBe('456');
 expect(new URL(target.searchParams.get('u')!).searchParams.get('t')).toBe('synthetic-current-ticket');
 for(const scenario of ['stale','date-conflict']){
  expect((await request.post(`${fixture}/__test__/flight-link-binding?scenario=${scenario}`)).ok()).toBe(true);
  const blocked=await request.get(`${fixture}/go/browser-13/flight`,{maxRedirects:0});expect(blocked.status()).toBe(503);
  expect(blocked.headers().location).toBeUndefined();
  await page.reload();await expect(page.locator('.booking-card a.cta')).toHaveCount(0);
  await expect(page.locator('.booking-card .partner-unavailable')).toContainText(getMessages(locale).noLink);
 }
});
