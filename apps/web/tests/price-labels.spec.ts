import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {scoreText} from '../src/lib/i18n/score-copy';
import {catalogText} from '../src/lib/i18n/catalog-copy';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: price comparison shows sample limits before the optional numerical calculation`,async({page,context},info)=>{
 test.setTimeout(120000);
 const t=(key:Parameters<typeof scoreText>[1])=>scoreText(locale,key);
 const path=localizedHref('/deals?origin=WRO&budget=220&sort=price',locale);
 await page.goto(path);
 const card=page.locator('.flight-offer-card').filter({has:page.locator(`a.deal-card-link[href^="${localizedHref('/deals/browser-deal?',locale)}"]`)});
 await expect(card.locator('.price-summary')).toBeVisible();
 await expect(card.locator('.price-summary')).toContainText(scoreText(locale,'sampleScope',{count:24}));
 await expect(card.locator('.price-summary')).not.toContainText(/\/100|%/);
 if(locale==='pl')await card.screenshot({path:info.outputPath('comparison-card.png')});
 const trigger=card.locator('.score-trigger');
 await expect(trigger).toContainText(t('trigger'));
 expect(await trigger.getAttribute('aria-label')).not.toMatch(/\/100|76/);
 await trigger.focus();await page.keyboard.press('Enter');
 const dialog=page.getByRole('dialog');
 await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('heading',{level:2})).toHaveText(t('price'));
 await expect(dialog.getByRole('button',{name:t('close'),exact:true})).toBeFocused();
 await expect(page).toHaveURL(new URL(path,info.project.use.baseURL).href);
 await expect(dialog.locator('.price-samples')).toBeVisible();
 await expect(dialog.locator('.price-samples')).toContainText('24');
 await expect(dialog).toContainText(t('intro'));
 const calculation=dialog.locator('.score-calculation');
 await expect(calculation.locator('summary')).toHaveText(t('calculation'));
 await expect(calculation).not.toHaveAttribute('open','');
 await expect(dialog.locator('.score-sum')).not.toBeVisible();
 await calculation.locator('summary').focus();await page.keyboard.press('Enter');
 await expect(dialog.locator('.score-sum')).toContainText(/41[,.]9 \+ 20 \+ 14[,.]1 = 76/);
 await expect(dialog.locator('.score-sum')).toContainText('76/100');
 await expect(dialog.locator('.score-part')).toHaveCount(3);
 await dialog.locator('.score-method').last().locator('summary').click();
 await expect(dialog).toContainText(t('grouping'));
 await expect(dialog.getByRole('link',{name:t('methodology'),exact:false})).toHaveAttribute('href',localizedHref('/info/price-comparison',locale));
 expect((await new AxeBuilder({page}).include('dialog[open]').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});
 expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl'){await dialog.evaluate(el=>{el.scrollTop=0;});await page.screenshot({path:info.outputPath('comparison-320.png')});}
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused();
 expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
 const opened=context.waitForEvent('page');await trigger.click({modifiers:['Control']});
 const detail=await opened;
 try{
  await expect(detail).toHaveURL(new URL((await trigger.getAttribute('href'))!,info.project.use.baseURL).href);
  await expect(detail.locator('.back-link')).toHaveAttribute('href',path);
  await expect(detail.locator('#score .score-calculation > summary')).toHaveText(t('calculation'));
  await expect(detail.locator('#score .score-sum')).not.toBeVisible();
 }finally{await detail.close();}
 for(const [slug,expected] of [['browser-2',t('insufficient')],['browser-3',t('legacyComparison')],['browser-1',catalogText(locale,'Brak wiarygodnego porównania tej ceny z historią.')]]){
  await page.goto(localizedHref('/deals/'+slug,locale));
  const summary=page.locator('.detail-summary .price-summary');
  await expect(summary).toHaveText(expected);
  await expect(summary).not.toContainText(/\/100|%/);
 }
});
