import {test,expect} from "@playwright/test";

test.use({javaScriptEnabled:false,userAgent:"Twitterbot/1.0"});

test("every sitemap page has server-rendered unique metadata and reachable editorial links",async({page,request},testInfo)=>{
 test.setTimeout(180000);
 const response=await request.get('/sitemap.xml');
 expect(response.status()).toBe(200);
 const urls=[...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 expect(urls.length).toBeGreaterThan(40);
 expect(new Set(urls).size).toBe(urls.length);
 const titles=new Set<string>(),descriptions=new Set<string>(),links=new Set<string>();
 const report=[];
 for(const url of urls){
  expect(new URL(url).origin).toBe('http://127.0.0.1:3100');
  expect(new URL(url).search).toBe('');
  const res=await page.goto(url);
  expect(res?.status(),url).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang','pl');
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main').filter({has:page.locator('h1')})).not.toBeEmpty();
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',url);
  const title=await page.title();
  const description=await page.locator('meta[name="description"]').getAttribute('content');
  expect(title.length).toBeGreaterThan(5);expect(description!.length).toBeGreaterThan(20);
  expect(titles.has(title),url).toBe(false);expect(descriptions.has(description!),url).toBe(false);
  titles.add(title);descriptions.add(description!);
  const robots=await page.locator('meta[name="robots"]').allTextContents();
  const directives=await page.locator('meta[name="robots"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('content')).join(','));
  expect(directives+','+(res?.headers()['x-robots-tag']??''),url).not.toMatch(/noindex|none/i);
  expect(robots.length).toBeLessThanOrEqual(1);
  const hrefs=await page.locator('main a[href]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')!));
  for(const href of hrefs)if(href.startsWith('/info/') && !href.includes('?'))links.add(href.split('#')[0]);
  report.push({path:new URL(url).pathname,status:res!.status(),title,description,robots:directives});
 }
 for(const href of links)expect((await request.get(href)).status(),href).toBe(200);
 await testInfo.attach('sitemap-audit',{body:JSON.stringify({pages:report,editorialLinks:[...links]},null,2),contentType:'application/json'});
});

test("robots allows crawlers to see noindex while excluding redirects and API",async({page,request})=>{
 const robots=await request.get('/robots.txt');expect(robots.status()).toBe(200);
 const text=await robots.text();
 expect(text).toContain('Allow: /');expect(text).toContain('Disallow: /api/');expect(text).toContain('Disallow: /go/');
 expect(text).toContain('Sitemap: http://127.0.0.1:3100/sitemap.xml');
 for(const path of ['/deals','/trip','/saved','/alerts'])expect(text).not.toContain(`Disallow: ${path}`);
 for(const path of ['/deals?origin=WRO&budget=1','/deals?offset=12','/deals?sort=price','/deals/browser-deal','/destinations/barcelona','/saved','/trip?plan=invalid','/alerts','/alerts/confirm','/alerts/manage']){
  expect((await page.goto(path))?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','http://127.0.0.1:3100'+(path.startsWith('/trip?')?'/trip':path));
 }
 await page.goto('/from/wro');
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','http://127.0.0.1:3100/from/WRO');
});

test("expired and nonexistent pages are noindex without a bookable price",async({page,browser},testInfo)=>{
 const statuses=[];
 const context=await browser.newContext({javaScriptEnabled:true});
 const rendered=await context.newPage();
 try {
 for(const path of ['/deals/browser-14','/deals/missing','/from/ZZZ','/destinations/missing','/info/missing-page','/missing-page']){
  const status=(await page.goto(path))!.status();
  // Next.js can already have sent 200 through a loading/Suspense boundary.
  expect(path==='/missing-page' ? [404] : [200,404],path).toContain(status);
  statuses.push({path,status});
  const directives=await page.locator('meta[name="robots"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('content')).join(','));
  expect(directives,path).toContain('noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('.deal-price')).toHaveCount(0);
  await expect(page.locator('a[href*="/go/"]')).toHaveCount(0);
  await rendered.goto('http://127.0.0.1:3100'+path);
  await expect(rendered.locator('main h1')).toContainText('Nie znaleziono');
  await expect(rendered.locator('.deal-price')).toHaveCount(0);
  await expect(rendered.locator('a[href*="/go/"]')).toHaveCount(0);
 }
 } finally {await context.close();}
 await testInfo.attach('unavailable-statuses',{body:JSON.stringify(statuses,null,2),contentType:'application/json'});
});
