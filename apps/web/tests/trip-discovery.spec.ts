import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test('home explains events and saved plans are reachable in the main navigation',async({page},testInfo)=>{
 await page.goto('/');
 await expect(page.locator('.hero')).toContainText('koncerty i mecze');
 const saved=page.getByRole('navigation',{name:'Nawigacja główna'}).getByRole('link',{name:'Zapisane',exact:true});
 await expect(saved).toBeInViewport();
 await saved.click();
 await expect(page).toHaveURL(/\/saved$/);
 await expect(saved).toHaveAttribute('aria-current','page');
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('.site-header').analyze()).violations).toEqual([]);
 await page.screenshot({path:testInfo.outputPath('saved-navigation.png')});
});

test('trip navigation jumps to events and provider city spellings are localized',async({page},testInfo)=>{
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const day=new URL(route.request().url()).searchParams.get('start_date');
  return route.fulfill({json:{status:'READY',partial:false,checked_at:null,events:[
   {id:'london',name:'London concert',city:'London'},
   {id:'milan',name:'Milano concert',city:'Milano'},
  ].map(item=>({...item,venue:'Sala koncertowa',category:'MUSIC',start_date:day,end_date:null,
   local_time:'20:00:00',timezone:'Europe/London',status:'onsale',price_from:null,currency:null,
   url:'https://ticketmaster.evyy.net/c/7853869/123/456'}))}});
 });
 await page.goto('/deals/browser-13');
 const nav=page.getByRole('navigation',{name:'Sekcje planu podróży'});
 const link=nav.getByRole('link',{name:'Wydarzenia',exact:true});
 await expect(link).toBeInViewport();
 await link.focus();await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/#trip-events$/);
 const events=page.locator('#trip-events');
 await expect(events).toBeFocused();
 await expect(events).toContainText('Sala koncertowa · Londyn');
 await expect(events).toContainText('Sala koncertowa · Mediolan');
 await expect(events).not.toContainText('Sala koncertowa · Milano');
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('.trip-navigation').include('#trip-events').analyze()).violations).toEqual([]);
 await events.screenshot({path:testInfo.outputPath('event-discovery.png')});
});
