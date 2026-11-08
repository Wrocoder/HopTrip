import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {tripText} from '../src/lib/i18n/trip-copy';
import {budgetText} from '../src/lib/i18n/budget-copy';
import {tripSectionCopy} from '../src/lib/i18n/trip-section-copy';
import {openGraphLocales} from '../src/lib/i18n/config';

test.setTimeout(120000);
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.route('https://api.nbp.pl/**',route=>route.fulfill({json:{table:'A',code:'EUR',rates:[{mid:4,effectiveDate:new Date().toISOString().slice(0,10)}]}}));
});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: countries, guide meaning, money, warnings and private plan keep their language`,async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const italy={pl:'Włochy',en:'Italy',ru:'Италия',uk:'Італія'},spain={pl:'Hiszpania',en:'Spain',ru:'Испания',uk:'Іспанія'};
 await page.goto(localizedHref('/destinations/milan',locale));
 const planning=page.locator('[data-destination-planning]');
 await expect(planning).toContainText(`${italy[locale]} (IT)`);
 for(const width of [320,375,390,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 if(locale==='ru'){await page.setViewportSize({width:320,height:900});await planning.screenshot({path:info.outputPath('country-ru-320.png'),scale:'css'});}
 await page.goto(localizedHref('/info/waw-airport',locale));
 await expect(page.locator('html')).toHaveAttribute('lang',locale);
 const terms={pl:/robotach kolejowych/,en:/engineering works/,ru:/ремонтных работах/,uk:/залізничних робіт/};
 await expect(page.locator('main')).toContainText(terms[locale]);
 await expect(page.locator('main')).not.toContainText(/railroad robots|железнодорожными роботами/);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','http://127.0.0.1:3100'+localizedHref('/info/waw-airport',locale));
 await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
 await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content',openGraphLocales[locale]);
 if(locale!=='pl')await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
 for(const width of [320,375,390,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
 await page.goto(localizedHref('/deals/browser-deal?returnTo='+encodeURIComponent('/deals?origin=WRO&sort=price'),locale));
 await expect(page.locator('#budget-flight')).toBeEnabled();
 await expect(page.locator('.page-heading .country-flag')).toHaveAttribute('title',spain[locale]);
 const sections=tripSectionCopy[locale];await expect(page.locator('.trip-navigation a')).toHaveText([sections.flight,sections.stay,sections.budget,sections.save]);
 await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');await page.locator('#budget-people').fill('2');
 await page.locator('#budget-flight').fill('-1');await expect(page.locator('#budget-flight')).toHaveAttribute('aria-invalid','true');
 await expect(page.locator('#calculator').getByRole('status')).toContainText(budgetText(locale,'Popraw zaznaczone pola i daty, aby obliczyć budżet.'));
 await page.locator('#budget-flight').fill('123.45');await expect(page.getByTestId('budget-total')).toContainText(/246[,.]90/);
 await expect(page.getByTestId('budget-total')).toContainText(locale==='pl'?'zł':'PLN');
 const plural={pl:'2 dorosłych',en:'2 adults',ru:'2 взрослых',uk:'2 дорослих'};await expect(page.getByTestId('flight-search-limitation')).toContainText(plural[locale]);
 if(locale==='ru'){await page.setViewportSize({width:320,height:900});await page.locator('.trip-navigation').screenshot({path:info.outputPath('navigation-ru-320.png'),scale:'css'});}
 await page.getByRole('button',{name:tripText(locale,'Udostępnij'),exact:true}).click();const shared=await page.locator('#trip-share-link').inputValue();await page.goto(shared);
 await expect(page.locator('html')).toHaveAttribute('lang',locale);await expect(page.locator('#budget-flight')).toHaveValue('123.45');
 await expect(page.getByTestId('budget-total')).toContainText(/246[,.]90/);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
 await page.goto(localizedHref('/trip#plan=broken',locale));await expect(page.getByRole('heading',{level:1})).toHaveText(tripText(locale,'Nie można odczytać planu'));
 expect(errors).toEqual([]);
});
