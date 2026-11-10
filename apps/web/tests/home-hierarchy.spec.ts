import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {homeText} from '../src/lib/i18n/home-copy';
import {localizedHref,pageLocales} from '../src/lib/i18n/routing';
import type {Airport,Destination,Deal} from '../src/lib/api';
import {stayRecommendationEligible} from '../src/lib/weekend-stay';
import {destinationImage} from '../src/lib/destination-imagery';
import {directoryCopy} from '../src/lib/i18n/directory-copy';

test.beforeEach(async({page,request})=>{
 await request.post('http://127.0.0.1:8100/__test__/short-trips?enabled=true');
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{await request.post('http://127.0.0.1:8100/__test__/short-trips?enabled=false');});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: search, offers, collections and help remain distinct and linked`,async({page,request},info)=>{
 test.setTimeout(90000);
 await page.goto(localizedHref('/?origin=KTW',locale));
 await expect(page.locator('html')).toHaveAttribute('lang',locale);
 await expect(page.locator('.catalog-section .deal-card')).toHaveCount(2);
 await expect(page.locator('.home-collections [data-collection="under-300"] .deal-card')).toHaveCount(2);
 await expect(page.locator('.home-collections [data-collection="upcoming-short"] .deal-card')).toHaveCount(2);
 const weekendRows=await(await request.get('http://127.0.0.1:8100/api/v1/deals?origin=KTW&round_trip=true&weekend_mode=calendar-v1&limit=100')).json();
 const weekendCount=Math.min(3,weekendRows.filter((row:Deal)=>row.flight_quality?.recommendation_eligible&&row.trip_quality?.recommendation?.planning_eligible===true&&stayRecommendationEligible(row,true)).length);
 await expect(page.locator('.home-collections [data-collection="calendar-weekend"] .deal-card')).toHaveCount(weekendCount);
 await expect(page.locator('main .deal-card')).toHaveCount(6+weekendCount);
 const order=['.hero','.catalog-section','section:has(> #home-collections)','section:has(> #home-destinations)','section:has(> #home-planning)','section:has(> #home-how)','section:has(> #home-guides)'];
 expect(await page.evaluate(selectors=>selectors.every((s,i)=>!i || !!(document.querySelector(selectors[i-1])!.compareDocumentPosition(document.querySelector(s)!) & Node.DOCUMENT_POSITION_FOLLOWING)),order)).toBe(true);
 for(const [id,key] of [['home-collections','Kolekcje na krótki wyjazd'],['home-planning','Zaplanuj podróż'],['home-how','Jak działa HopTrip'],['home-guides','Poradniki i pomoc']] as const)
  await expect(page.locator('#'+id)).toHaveText(homeText(locale,key));
 for(const route of ['/city-break','/tanie-loty-na-weekend','/from/warszawa','/deals','/info/trip-budget#calculator','/saved','/info/price-comparison','/info/partners','/info'])
  await expect(page.locator(`.home-section > .route-link-grid > a[href="${localizedHref(route,locale)}"], .home-section > p > a[href="${localizedHref(route,locale)}"]`)).toHaveCount(1);
 // Homepage stays bounded; the directory owns the complete destination registry.
 const airports:Airport[]=await(await request.get('http://127.0.0.1:8100/api/v1/airports')).json();
 const destinations:Destination[]=await(await request.get('http://127.0.0.1:8100/api/v1/destinations')).json();
 const pictured=destinations.filter(d=>d.is_active&&destinationImage(d.slug)).slice(0,3);
 for(const d of pictured){const route=pageLocales(`/destinations/${d.slug}`).includes(locale)?`/destinations/${d.slug}`:`/deals?destination=${encodeURIComponent(d.slug)}`;
  await expect(page.locator(`.destination-links a[href="${localizedHref(route,locale)}"]`)).toHaveCount(1);}
 await expect(page.locator('.destination-links li')).toHaveCount(pictured.length);
 await expect(page.locator('.destination-links').getByRole('link',{name:directoryCopy[locale].all})).toHaveAttribute('href',localizedHref('/destinations',locale));
 const summary=page.locator('.home-airports summary');await summary.focus();await summary.press('Enter');
 for(const a of airports){const route=pageLocales(`/from/${a.iata_code}`).includes(locale)?`/from/${a.iata_code}`:`/deals?origin=${a.iata_code}`;
  await expect(page.locator(`.home-airports a[href="${localizedHref(route,locale)}"]`)).toBeVisible();}
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 if(locale==='pl')await page.screenshot({path:info.outputPath('hierarchy.png'),fullPage:true});
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 if(locale==='pl')await page.screenshot({path:info.outputPath('hierarchy-320.png'),fullPage:true});
 await page.locator('main').getByRole('link',{name:homeText(locale,'Policz budżet podróży'),exact:true}).click();
 await expect(page).toHaveURL(new RegExp('/info/trip-budget#calculator$'));
 await expect(page.locator('#calculator')).toBeVisible();
});
