import {test,expect} from '@playwright/test';
import {chooseOrigin} from './origin-helpers';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test('airport preference survives navigation, the shared home control and reload, then reset clears it',async({page,context})=>{
 await page.goto('/');
 const origin=page.getByRole('combobox',{name:'Skąd',exact:true});
 await origin.fill('WRO');
 await page.getByRole('button',{name:'Znajdź tani lot',exact:true}).click();
 await expect(page).toHaveURL(/\/deals\?origin=WRO/);
 expect((await context.cookies()).find(cookie=>cookie.name==='hoptrip.origin.v1')).toMatchObject({value:'WRO',httpOnly:true,path:'/'});
 await page.goto('/');
 await expect(origin).toHaveValue('Wrocław — WRO');
 await expect(page.locator('#short-trip-origin')).toHaveCount(0);
 await page.getByRole('button',{name:'Zmień lotnisko',exact:true}).click();await expect(origin).toBeFocused();
 await chooseOrigin(page,'KRK');
 await expect(page).toHaveURL(/\/\?origin=KRK/);
 await expect(origin).toHaveValue('Kraków — KRK');
 await page.reload();
 await expect(origin).toHaveValue('Kraków — KRK');
 expect((await context.cookies()).find(cookie=>cookie.name==='hoptrip.origin.v1')?.value).toBe('KRK');
 await page.goto('/deals?origin=KRK&budget=1');
 await page.getByRole('link',{name:'Wyczyść wszystkie filtry',exact:true}).click();
 await expect(page).toHaveURL(/\/deals$/);
 expect((await context.cookies()).find(cookie=>cookie.name==='hoptrip.origin.v1')).toBeUndefined();
 await page.goto('/');
 await expect(origin).toHaveValue('');
});

test('[AUD-03 F01] detail back link preserves the selected search',async({page})=>{
 const search='/deals?origin=WRO&budget=220&sort=price';
 await page.goto(search);
 await page.locator('.deal-card-link').first().click();
 await expect(page.locator('.back-link')).toBeVisible();
 await page.locator('.back-link').click();
 // UX-01: the explicit return context preserves this search after detail navigation.
 await expect(page).toHaveURL(/\/deals(?:\?|$)/);
 await expect(page).toHaveURL(new URL(search,test.info().project.use.baseURL).href);
});
