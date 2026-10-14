// Local, dependency-free SVG layout; Playwright exports review PNGs without external requests.
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('../../apps/web/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,'offers-snapshot.json'),'utf8').replace(/^\uFEFF/,''));
const labels={Gdansk:['Gdańsk','WRO → GDN','30.10–02.11.2026','Powrót w poniedziałek. Sprawdź swój kalendarz.'],London:['Londyn Luton','WRO → LTN','19–21.11.2026','Dolicz transfer z Luton do miejsca noclegu.'],Barcelona:['Barcelona','WRO → BCN','28.11–01.12.2026','Powrót we wtorek. Uwzględnij urlop.']};
const main='https://hoptrip.pl/from/WRO?utm_source=instagram&utm_medium=organic_social&utm_campaign=wro-weekend&utm_content=carousel_20261012';
const slides=[{title:['Krótki wyjazd','z Wrocławia'],kicker:'3 KIERUNKI · 2–3 NOCE',big:'Policz całą podróż.',body:['Porównaj lot z WRO.','Dolicz nocleg, dojazdy i jedzenie.','Przesuń po trzy propozycje.'],href:main},
 ...snapshot.offers.map(o=>{
  const [city,route,dates,note]=labels[o.destination_city];
  return {title:[city],kicker:route,big:`${Number(o.flight_price_pln)} zł / osoba`,body:[`${dates} · ${o.nights} noce`,'Zapisana cena lotu w obie strony.',note],href:`https://hoptrip.pl/deals/${o.slug}?utm_source=instagram&utm_medium=organic_social&utm_campaign=wro-weekend&utm_content=carousel_20261012`};
 }),
 {title:['Bilet to nie','cały budżet'],kicker:'ZANIM WYBIERZESZ',big:'Co doliczyć?',body:['Nocleg dla całej grupy.','Transfery, jedzenie i bagaż.','Sprawdź zakres taryfy u sprzedawcy.'],href:main},
 {title:['Porównaj terminy.','Policz koszty.'],kicker:'HOPTRIP · WRO',big:'Zacznij od WRO.',body:['Otwórz wybraną propozycję.','Wpisz własne koszty w kalkulatorze.','Więcej lotów: link w bio.'],href:main}];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const wrap=(s,max=34)=>{const lines=[];let line='';for(const word of s.split(' ')){if((line+' '+word).trim().length>max&&line){lines.push(line);line=word;}else line=(line+' '+word).trim();}if(line)lines.push(line);return lines;};
for(const [i,s] of slides.entries()){
 s.alt=[s.kicker,...s.title,s.big,...s.body,'Odczyt katalogu: 13.10.2026, 08:57 CEST. Ceny mogą się zmienić. Nocleg i dojazdy osobno. HopTrip zawiera linki afiliacyjne. Wersja robocza.'].join(' ');
 let y=640;
 const body=s.body.flatMap(line=>wrap(line)).map(line=>{const text=`<text x="80" y="${y}" font-size="42">${esc(line)}</text>`;y+=64;return text;}).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350" role="img" aria-labelledby="title desc">
 <title id="title">${esc(s.title.join(' '))}</title><desc id="desc">${esc(s.alt)}</desc>
 <rect width="1080" height="1350" fill="#f4f6ee"/><rect x="40" y="40" width="1000" height="1270" rx="36" fill="#fffef8" stroke="#cbd8cd"/>
 <g fill="#203c32" font-family="Arial, sans-serif"><text x="80" y="120" font-size="36" font-weight="700">HopTrip ↗</text><text x="690" y="115" font-size="25">WERSJA ROBOCZA</text>
 <text x="80" y="220" font-size="30" letter-spacing="3">${esc(s.kicker)}</text>
 ${s.title.map((line,j)=>`<text x="80" y="${345+j*95}" font-family="Georgia, serif" font-weight="700" font-size="76">${esc(line)}</text>`).join('')}
 <text x="80" y="550" font-size="62" font-weight="700" fill="#286148">${esc(s.big)}</text>${body}
 <a href="${esc(s.href)}"><rect x="80" y="1015" width="920" height="94" rx="20" fill="#235b43"/><text x="540" y="1076" text-anchor="middle" font-size="35" fill="white">hoptrip.pl · sprawdź propozycje</text></a>
 <text x="80" y="1163" font-size="28">Odczyt katalogu: 13.10.2026, 08:57 CEST.</text>
 <text x="80" y="1207" font-size="27">Ceny mogą się zmienić. Nocleg i dojazdy osobno.</text>
 <text x="80" y="1250" font-size="26">Linki afiliacyjne na HopTrip · możliwa prowizja.</text>
 <text x="950" y="1300" font-size="22">${i+1}/6</text></g></svg>`;
 fs.writeFileSync(path.join(__dirname,`slide-${i+1}.svg`),svg);
}
fs.writeFileSync(path.join(__dirname,'slides.json'),JSON.stringify(slides,null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'index.html'),`<!doctype html><html lang="pl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>HopTrip · karuzela WRO · wersja robocza</title><style>body{margin:24px;background:#f4f6ee;color:#203c32;font:18px Arial}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}img{width:100%;height:auto}h1{font-family:Georgia}a{color:#235b43}</style><h1>Krótki wyjazd z Wrocławia</h1><p>Wersja do akceptacji · dane odczytane 13.10.2026 · nic nie opublikowano.</p><p><a href="pakiet.md">Teksty, scenariusz wideo, linki i pomiar</a></p><main>${slides.map((s,i)=>`<a href="slide-${i+1}.png"><img src="slide-${i+1}.svg" alt="${esc(s.alt)}"></a>`).join('')}</main></html>`);
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
 for(let i=1;i<=6;i++){await page.goto(pathToFileURL(path.join(__dirname,`slide-${i}.svg`)).href);await page.screenshot({path:path.join(__dirname,`slide-${i}.png`)});}
 await page.setViewportSize({width:1440,height:1200});await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);await page.screenshot({path:path.join(__dirname,'preview.png'),fullPage:true});
 console.log('Rendered 6 SVG + 6 PNG slides and preview.');
}finally{await browser.close();}})().catch(e=>{console.error(e.message);process.exitCode=1;});
