/* Run against editor_e2e_app on its fixed loopback port. No external requests allowed. */
const {chromium, expect} = require('../../web/node_modules/@playwright/test');
const {default: AxeBuilder} = require('../../web/node_modules/@axe-core/playwright');
const fs = require('node:fs');
const path = require('node:path');

(async()=>{
  const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  const screenshots=path.resolve('.worktrees/editor-preview');fs.mkdirSync(screenshots,{recursive:true});
  try{
    for(const [name,viewport] of [['desktop',{width:1440,height:1100}],['mobile',{width:390,height:844}]]){
      const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
      await page.goto('http://127.0.0.1:8111/api/v1/editor/');
      await page.getByLabel('Пароль редакции').fill('editor-browser-fixture');
      await page.getByRole('button',{name:'Войти в редакцию'}).click();
      await expect(page.getByRole('heading',{name:'Редакционный стол'})).toBeVisible();
      await page.locator('#new').click();
      await expect(page.locator('#event option')).toHaveCount(1);
      await page.getByRole('button',{name:'Создать черновик',exact:true}).first().click();
      await expect(page.locator('#preview-text')).toContainText('Barcelona Jazz Night');
      await expect(page.locator('#preview-text')).toContainText('Linki partnerskie');
      await expect(page.locator('#export')).toBeDisabled();
      await page.locator('#text').fill('Wrocław → Barcelona. Pomysł na muzyczny weekend.');
      await expect(page.locator('#approve')).toBeDisabled();
      await page.locator('#save').click();await expect(page.locator('#revision')).toContainText('версия 2');
      await page.locator('#channel').selectOption('instagram');
      await expect(page.locator('#channel-note')).toContainText('не предполагается кликабельной');
      await page.locator('#channel').selectOption('telegram');
      await expect(page.locator('#text')).toHaveValue('Wrocław → Barcelona. Pomysł na muzyczny weekend.');
      await page.locator('#approve').click();await expect(page.locator('#status')).toHaveText('Одобрено для dry-run');
      const download=page.waitForEvent('download');await page.locator('#export').click();
      const file=await download;const artifact=path.join(screenshots,`${name}-package.json`);await file.saveAs(artifact);
      const payload=JSON.parse(fs.readFileSync(artifact,'utf8'));
      if(payload.publishable!==false||payload.accounts.length||!payload.variants.telegram)throw Error('Invalid dry-run package');
      await expect(page.locator('#message')).toContainText('Пакет скачан');
      const rehearsalDownload=page.waitForEvent('download');await page.locator('#rehearse-now').click();
      const rehearsal=await rehearsalDownload;const rehearsalPath=path.join(screenshots,`${name}-rehearsal.json`);await rehearsal.saveAs(rehearsalPath);
      const queued=JSON.parse(fs.readFileSync(rehearsalPath,'utf8'));
      if(queued.publishable!==false||queued.accounts.length||queued.checksum!==payload.checksum)throw Error('Invalid rehearsal package');
      await expect(page.locator('#rehearsal-status')).toContainText('Пакет подготовлен');
      await expect(page.locator('#schedule')).toBeDisabled();
      const a11y=await new AxeBuilder({page}).analyze();
      if(a11y.violations.length)throw Error(JSON.stringify(a11y.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
      if(overflow||errors.length)throw Error(JSON.stringify({overflow,errors}));
      await page.screenshot({path:path.join(screenshots,`${name}.png`),fullPage:true});
      await page.locator('#refresh').click();await expect(page.locator('#revision')).toContainText('версия 3');
      await expect(page.locator('#rehearsal-status')).toContainText('Отменено');
      await expect(page.locator('#export')).toBeDisabled();
      await page.locator('#reject').click();await expect(page.locator('#status')).toHaveText('Отклонено');
      await page.locator('#logout').click();await expect(page.locator('#login')).toBeVisible();
      await context.close();console.log(`${name}: workflow, export, revision, accessibility, overflow passed`);
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
