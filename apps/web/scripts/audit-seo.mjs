import {chromium} from "@playwright/test";

function origin(value) {
 const url=new URL(value);
 if(!["http:","https:"].includes(url.protocol) || url.username || url.password ||
    url.pathname!=="/" || url.search || url.hash) throw new Error("Expected an HTTP(S) origin without credentials or path");
 return url.origin;
}
const base=origin(process.argv[2] ?? "http://127.0.0.1:58080");
const canonical=origin(process.argv[3] ?? base);
const staging=process.argv.includes("--staging");
const failures=[];
function check(ok,message) { if(!ok) failures.push(message); }
const browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHANNEL ? {channel:process.env.PLAYWRIGHT_CHANNEL} : {})});
try {
 const context=await browser.newContext();
 const page=await context.newPage();
 page.setDefaultNavigationTimeout(15000);
 const sitemap=await context.request.get(`${base}/sitemap.xml`,{timeout:15000,maxRedirects:0});
 check(sitemap.status()===200,"sitemap: expected HTTP 200");
 const urls=await page.evaluate(xml=>{
  const doc=new DOMParser().parseFromString(xml,"application/xml");
  if(doc.querySelector("parsererror")) throw new Error("Invalid sitemap XML");
  return [...doc.querySelectorAll("url > loc")].map(node=>node.textContent);
 },await sitemap.text());
 check(urls.length===27,`sitemap: expected 27 URLs, got ${urls.length}`);
 check(new Set(urls).size===urls.length,"sitemap: duplicate URLs");
 const paths=[];
 const titles=new Set(), descriptions=new Set();
 for(const loc of urls) {
  const url=new URL(loc), path=url.pathname;
  check(url.origin===canonical && !url.search && !url.hash,`${path}: incorrect sitemap URL`);
  check(path==="/" || path==="/info" || /^\/info\/[a-z-]+$/.test(path),`${path}: unexpected sitemap path`);
  paths.push(path);
  // Fetch only the server explicitly selected by the operator, never sitemap hosts.
  const response=await page.goto(`${base}${path}`);
  check(response?.status()===200 && new URL(page.url()).pathname===path,`${path}: expected HTTP 200 without redirect`);
  const data=await page.evaluate(()=>({
   title:document.title,
   description:document.querySelector('meta[name="description"]')?.content,
   canonical:[...document.querySelectorAll('link[rel="canonical"]')].map(node=>node.href),
   robots:[...document.querySelectorAll('meta[name="robots"]')].map(node=>node.content).join(","),
   ogTitle:document.querySelector('meta[property="og:title"]')?.content,
   ogDescription:document.querySelector('meta[property="og:description"]')?.content,
   ogUrl:document.querySelector('meta[property="og:url"]')?.content,
   lang:document.documentElement.lang, headings:document.querySelectorAll("h1").length,
  }));
  check(data.lang==="pl" && data.headings===1,`${path}: expected Polish lang and one h1`);
  check(Boolean(data.title) && !titles.has(data.title),`${path}: missing or duplicate title`);
  check(Boolean(data.description) && !descriptions.has(data.description),`${path}: missing or duplicate description`);
  titles.add(data.title); descriptions.add(data.description);
  check(data.canonical.length===1 && new URL(data.canonical[0]).href===new URL(path,canonical).href,`${path}: incorrect canonical`);
  const headerRobots=response?.headers()["x-robots-tag"] ?? "";
  if(staging) check(/noindex/i.test(headerRobots),`${path}: staging requires X-Robots-Tag noindex`);
  else check(!/noindex|none/i.test(data.robots+","+headerRobots),`${path}: unexpected noindex`);
  check(Boolean(data.ogTitle) && Boolean(data.ogDescription),`${path}: missing Open Graph metadata`);
  if(path!=="/") check(data.ogUrl===`${canonical}${path}`,`${path}: incorrect Open Graph URL`);
  if(path.startsWith("/info/")) {
   const image=await page.locator('meta[property="og:image"]').getAttribute("content");
   check(image===`${canonical}/share/${path.split("/").pop()}`,`${path}: incorrect share image URL`);
   check(await page.locator('meta[name="twitter:card"]').getAttribute("content")==="summary_large_image",`${path}: missing large Twitter card`);
   check(await page.locator('meta[name="twitter:image"]').getAttribute("content")===image,`${path}: inconsistent Twitter image`);
   const preview=await context.request.get(`${base}/share/${path.split("/").pop()}`);
   const png=await preview.body();
   check(preview.status()===200 && preview.headers()["content-type"]?.startsWith("image/png") &&
    png.length>24 && png.subarray(1,4).toString()==="PNG" && png.readUInt32BE(16)===1200 && png.readUInt32BE(20)===630 && png.length<1000000,
    `${path}: invalid or oversized 1200x630 PNG preview`);
   const breadcrumb=await page.locator('script[type="application/ld+json"]').evaluateAll(nodes=>
    nodes.map(node=>JSON.parse(node.textContent)).find(item=>item["@type"]==="BreadcrumbList"));
   const expected=["/","/info",path].map((href,index)=>({"@type":"ListItem",position:index+1,
    name:index===0 ? "Strona główna" : index===1 ? "Jak działa HopTrip" : data.title,item:new URL(href,canonical).href}));
   check(breadcrumb?.["@context"]==="https://schema.org" &&
    JSON.stringify(breadcrumb.itemListElement)===JSON.stringify(expected),`${path}: incorrect breadcrumb structured data`);
   const nav=page.getByRole("navigation",{name:"Ścieżka nawigacji"});
   check(await nav.locator('a[href="/"]').count()===1 && await nav.locator('a[href="/info"]').count()===1,
    `${path}: missing breadcrumb links`);
   check(await nav.locator('[aria-current="page"]').textContent()===data.title,`${path}: incorrect current breadcrumb`);
   await page.setViewportSize({width:320,height:740});
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${path}: horizontal overflow at 320px`);
  }
 }
 check(paths.includes("/") && paths.includes("/info"),"sitemap: missing home or editorial index");
 for(const path of ["/info/contact","/info/privacy","/info/terms","/deals","/deals?origin=WRO","/from/WRO","/destinations/barcelona"]) {
  check(!paths.includes(path),`${path}: must not appear in sitemap`);
  const response=await page.goto(`${base}${path}`);
  check(response?.status()===200,`${path}: expected HTTP 200`);
  const robots=await page.locator('meta[name="robots"]').evaluateAll(nodes=>nodes.map(node=>node.content).join(","));
  check(/noindex/i.test(robots),`${path}: missing noindex`);
  if(path.startsWith("/info/")) check(await page.locator('script[type="application/ld+json"]').count()===0,`${path}: draft must not advertise structured data`);
 }
 const missing=await page.goto(`${base}/info/seo-audit-missing-page`);
 for(const slug of ["privacy","terms","contact","constructor","seo-audit-missing-page"]) {
  check((await context.request.get(`${base}/share/${slug}`)).status()===404,`${slug}: draft/unknown share image must be 404`);
 }
 // Next.js can send 200 once streaming has started; the not-found UI must be noindex.
 check([200,404].includes(missing?.status()),"unknown article: unexpected HTTP status");
 check(await page.locator("main").innerText().then(text=>/HopTrip · 404/i.test(text)),"unknown article: missing not-found UI");
 check(await page.locator('meta[name="robots"]').evaluateAll(nodes=>nodes.some(node=>/noindex/i.test(node.content))),"unknown article: missing noindex");
 const robots=await context.request.get(`${base}/robots.txt`,{timeout:15000,maxRedirects:0});
 check(robots.status()===200,"robots.txt: expected HTTP 200");
 const robotLines=(await robots.text()).split(/\r?\n/);
 if(staging) {
  check(robotLines.includes("User-agent: *") && robotLines.includes("Disallow: /"),"robots.txt: staging must disallow crawling");
  const admin=await context.request.get(`${base}/api/v1/admin/system/status`,{timeout:15000,maxRedirects:0});
  check(admin.status()===404,"staging: public admin endpoint must be blocked");
 } else check(robotLines.includes(`Sitemap: ${canonical}/sitemap.xml`),"robots.txt: incorrect sitemap origin");
 console.log(JSON.stringify({pages:urls.length,failures},null,2));
 process.exitCode=failures.length ? 1 : 0;
} finally {
 await browser.close();
}
