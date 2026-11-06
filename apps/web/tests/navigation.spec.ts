import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {navigation} from '../src/lib/i18n/navigation';
import {localizedHref} from '../src/lib/i18n/routing';
import {directoryCopy} from '../src/lib/i18n/directory-copy';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: primary journeys, hash history and secondary information`,async({page},info)=>{
 test.setTimeout(120000);
 const labels=navigation[locale];
 await page.goto(localizedHref('/saved',locale));
 const nav=page.getByRole('navigation',{name:labels.main,exact:true});
 await expect(nav.getByRole('link')).toHaveText([labels.flights,labels.weekend,labels.destinations,labels.saved,labels.budget]);
 await expect(nav.locator('[aria-current]')).toHaveCount(1);
 for(const [key,route] of [['budget','/info/trip-budget'],['saved','/saved'],['weekend','/tanie-loty-na-weekend'],['flights','/deals']] as const){
  await nav.getByRole('link',{name:labels[key],exact:true}).click();
  await expect(page).toHaveURL(new URL(localizedHref(route,locale),info.project.use.baseURL).href);
  await expect(nav.getByRole('link',{name:labels[key],exact:true})).toHaveAttribute('aria-current','page');
  await expect(nav.locator('[aria-current]')).toHaveCount(1);
 }
 await nav.getByRole('link',{name:labels.destinations,exact:true}).click();
 await expect(page).toHaveURL(new URL(localizedHref('/destinations',locale),info.project.use.baseURL).href);
 await expect(page.getByRole('heading',{level:1})).toHaveText(directoryCopy[locale].heading);
 await expect(nav.getByRole('link',{name:labels.destinations,exact:true})).toHaveAttribute('aria-current','page');
 await page.goBack();await expect(nav.getByRole('link',{name:labels.flights,exact:true})).toHaveAttribute('aria-current','page');
 await page.goForward();await expect(nav.getByRole('link',{name:labels.destinations,exact:true})).toHaveAttribute('aria-current','page');
 // Country anchors keep the directory selected; legacy home bookmarks still work.
 await page.evaluate(()=>{location.hash='country-IT';});
 await expect(nav.getByRole('link',{name:labels.destinations,exact:true})).toHaveAttribute('aria-current','page');
 await page.goto(localizedHref('/#home-destinations',locale));
 await expect(page.locator('#home-destinations')).toBeInViewport();
 await expect(nav.getByRole('link',{name:labels.destinations,exact:true})).toHaveAttribute('aria-current','location');
 await nav.getByRole('link',{name:labels.destinations,exact:true}).click();
 await expect(nav.getByRole('link',{name:labels.destinations,exact:true})).toHaveAttribute('aria-current','page');
 const footer=page.locator('.footer-nav');
 for(const route of ['/info','/info/about','/info/contact','/info/privacy','/info/terms','/info/partners','/alerts','/city-break','/from/warszawa'])
  await expect(footer.locator(`a[href="${localizedHref(route,locale)}"]`)).toHaveCount(1);
 await footer.getByRole('link',{name:labels.howItWorks,exact:true}).click();
 await expect(page).toHaveURL(new URL(localizedHref('/info',locale),info.project.use.baseURL).href);
 await expect(nav.locator('[aria-current]')).toHaveCount(0);
 expect((await new AxeBuilder({page}).include('.site-header').include('.site-footer').analyze()).violations).toEqual([]);
 if(locale==='pl')await page.locator('.site-header').screenshot({path:info.outputPath('header.png')});
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 for(const link of await nav.getByRole('link').all()){
  await expect(link).toBeVisible();expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
 }
 await nav.getByRole('link').first().focus();await page.keyboard.press('Tab');
 await expect(nav.getByRole('link',{name:labels.weekend,exact:true})).toBeFocused();
 if(locale==='pl')await page.locator('.site-header').screenshot({path:info.outputPath('header-320.png')});
});
