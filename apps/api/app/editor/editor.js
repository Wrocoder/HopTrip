"use strict";
const $ = (id) => document.getElementById(id);
const base = "/api/v1/editor";
const labels = {DRAFT:"Черновик",APPROVED:"Одобрено для dry-run",REJECTED:"Отклонено",NEEDS_REVIEW:"Нужна проверка"};
const actions = {CREATED:"Создан черновик",REVISED:"Создана новая версия",APPROVED_DRY_RUN:"Одобрено для dry-run",REJECTED:"Отклонено",STALE:"Источник устарел",DRY_RUN:"Выгружен пакет"};
const names = {telegram:"Telegram",facebook:"Facebook",instagram:"Instagram",tiktok:"TikTok",linkedin:"LinkedIn"};
let csrf = "", current = null, variants = {}, channel = "telegram", dirty = false, sources = null, busy = false;
let sourceRequest = 0;
function notice(text, error=false){$("message").textContent=text;$("message").dataset.error=String(error);$("message").hidden=false;}
function date(value){return value ? new Intl.DateTimeFormat("ru-RU",{dateStyle:"medium",timeStyle:"short",timeZone:"Europe/Warsaw"}).format(new Date(value)) : "—";}
async function api(path, body){
  const response=await fetch(base+path,{method:body===undefined?"GET":"POST",credentials:"same-origin",
    headers:body===undefined?{}:{"Content-Type":"application/json","X-CSRF-Token":csrf},body:body===undefined?undefined:JSON.stringify(body)});
  let data;try{data=await response.json();}catch{throw new Error("Не удалось прочитать ответ. Попробуйте ещё раз.");}
  if(!response.ok){if(response.status===401)showLogin();throw new Error(typeof data.detail==="string"?data.detail:"Проверьте заполнение полей");}return data;
}
async function run(task){if(busy)return;busy=true;document.querySelectorAll("button,input,select,textarea").forEach(b=>b.disabled=true);
  try{await task();}catch(error){notice(error.message,true);}finally{busy=false;document.querySelectorAll("button,input,select,textarea").forEach(b=>b.disabled=false);controls();}}
function showLogin(){csrf="";current=null;variants={};dirty=false;$("detail").hidden=true;$("empty").hidden=false;$("workspace").hidden=true;$("login").hidden=false;$("logout").hidden=true;}
async function enter(session){csrf=session.csrf;$("login").hidden=true;$("workspace").hidden=false;$("logout").hidden=false;$("password").value="";await list();}
function controls(){if(!current)return;$("save").disabled=busy||!dirty;$("approve").disabled=busy||dirty||!!current.issue||["REJECTED","NEEDS_REVIEW","APPROVED"].includes(current.status);
  $("export").disabled=busy||dirty||!current.approved_channels.length;$("reject").disabled=busy||dirty||current.status==="REJECTED";
  $("approval-note").textContent=dirty?"Есть несохранённые изменения. Сначала сохраните новую версию.":current.approval_expires_at?`Одобрено до ${date(current.approval_expires_at)} (Варшава). Каналы: ${current.approved_channels.map(c=>names[c]).join(", ")}.`:"Аккаунты не подключены. Это одобрение подготовки, а не отправки.";
}
async function list(){const rows=await api("/items");$("items").replaceChildren();$("count").textContent=rows.length;
  for(const row of rows){const button=document.createElement("button");button.className="item";button.setAttribute("aria-current",String(current?.id===row.id));
    button.append(document.createTextNode(row.title));const small=document.createElement("small");small.textContent=`v${row.version} · ${labels[row.status]}`;button.append(small);
    button.onclick=()=>{if(dirty){notice("Сохраните изменения перед переходом к другому черновику.",true);return;}run(async()=>{show(await api(`/items/${row.id}`));await list();});};$("items").append(button);}
  if(!rows.length)$("items").textContent="Пока нет черновиков";
}
function fact(label,value,url){const dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=label;
  if(url){const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=value;dd.append(a);}else dd.textContent=value;$("facts").append(dt,dd);}
function show(item){current=item;variants={...item.variants};dirty=false;$("empty").hidden=true;$("detail").hidden=false;
  $("title").textContent=item.snapshot.facts.title;$("revision").textContent=`Черновик #${item.id} · версия ${item.version} · PL`;
  $("status").textContent=labels[item.status];$("issue").hidden=!item.issue;$("issue").textContent=item.issue||"";
  $("media").src=item.media.url;$("facts").replaceChildren();const f=item.snapshot.facts;
  fact("Источник HopTrip",f.url,f.url);fact("Проверено в каталоге",date(item.snapshot.checked_at));fact("Версия актуальна до",date(item.snapshot.valid_until));
  if(f.event){fact("Цена перелёта",`${f.flight_price_pln} PLN/чел. · ${f.trip_type==="ROUND_TRIP"?"туда и обратно":"в одну сторону"} · пассажиров: ${f.travelers}`);
    fact("Наблюдение цены",date(item.snapshot.price_observed_at));fact("Событие",f.event.name,f.event.url);fact("Данные события",date(item.snapshot.event_checked_at));fact("Период поездки",`${f.start} — ${f.end}`);
  }else{fact("Редактура гайда",f.reviewed_at);fact("Версия источника",String(f.version));}
  $("history").replaceChildren();for(const entry of item.history){const li=document.createElement("li");li.textContent=`${date(entry.at)} · v${entry.version} · ${actions[entry.action]||entry.action} · ${entry.owner}`;$("history").append(li);}
  document.querySelectorAll("#channels input").forEach(c=>c.checked=item.approved_channels.length?item.approved_channels.includes(c.value):c.value==="telegram");
  channel=$("channel").value;changeChannel();controls();
}
function changeChannel(){channel=$("channel").value;$("text").value=variants[channel]||"";
  $("channel-note").textContent=channel==="tiktok"?"Текст сценария. Для публикации потребуется видео; SVG-карточка его не заменяет.":channel==="instagram"?"Подпись к будущей публикации. Ссылка в тексте не предполагается кликабельной.":"Текст и иллюстрация для будущей публикации. Аккаунт не подключён.";preview();}
function preview(){if(!current)return;const original=current.variants[channel],rendered=current.rendered[channel];$("preview-text").textContent=variants[channel]+rendered.slice(original.length);$("text-count").textContent=`${variants[channel].length} / 1800 символов основного текста`;controls();}
async function openComposer(){if(dirty){notice("Сохраните текущие изменения.",true);return;}sources=await api("/sources");
  $("deal").replaceChildren();for(const d of sources.deals){$("deal").add(new Option(`${d.title} · ${d.start} · ${d.price} PLN`,d.id));}
  $("guide").replaceChildren();for(const [id,g] of Object.entries(sources.guides))$("guide").add(new Option(g.title,id));
  $("composer").hidden=false;await sourceType();$("kind").focus();}
async function sourceType(){const guide=$("kind").value==="guide";["deal-label","event-label","stay-label"].forEach(id=>$(id).hidden=guide);$("guide-label").hidden=!guide;
  if(!guide)await sourceEvents();}
async function sourceEvents(){const request=++sourceRequest,id=Number($("deal").value),d=sources.deals.find(d=>d.id===id);$("event").replaceChildren();
  if(!d){notice("В каталоге нет свежих перелётов. Можно подготовить публикацию гайда.");return;}
  $("stay-label").hidden=d.trip_type!=="ONE_WAY";$("stay").value=d.end;$("stay").min=d.start;
  const rows=await api(`/sources/${id}/events`);if(request!==sourceRequest)return;
  for(const e of rows)$("event").add(new Option(`${e.date} · ${e.name}`,e.id));if(!rows.length)notice("Для этого перелёта нет свежих событий. Выберите другой перелёт или гайд.");}
$("login-form").onsubmit=e=>{e.preventDefault();run(async()=>{await enter(await api("/login",{password:$("password").value}));$("message").hidden=true;});};
$("logout").onclick=()=>run(async()=>{await api("/logout",{});showLogin();});
$("new").onclick=$("empty-new").onclick=()=>run(openComposer);$("cancel-create").onclick=()=>$("composer").hidden=true;
$("kind").onchange=()=>run(sourceType);$("deal").onchange=()=>run(sourceEvents);
$("create-form").onsubmit=e=>{e.preventDefault();run(async()=>{const kind=$("kind").value;
  if(kind==="offer"&&(!$("deal").value||!$("event").value))throw new Error("Выберите перелёт и событие");
  show(await api("/items",{kind,deal_id:Number($("deal").value)||null,event_id:Number($("event").value)||null,stay_until:$("stay").value,guide:$("guide").value}));
  $("composer").hidden=true;await list();notice("Черновик создан. Проверьте текст и источники.");});};
$("channel").onchange=changeChannel;$("text").oninput=()=>{variants[channel]=$("text").value;dirty=JSON.stringify(variants)!==JSON.stringify(current.variants);preview();};
async function revise(refresh){show(await api(`/items/${current.id}/revise`,{version:current.version,variants,refresh_source:refresh}));await list();notice(refresh?"Источник обновлён, тексты созданы заново. Проверьте новую версию.":"Новая версия сохранена. Требуется новое одобрение.");}
$("save").onclick=()=>run(()=>revise(false));$("refresh").onclick=()=>run(()=>revise(true));
$("approve").onclick=()=>run(async()=>{const channels=[...document.querySelectorAll("#channels input:checked")].map(c=>c.value);if(!channels.length)throw new Error("Выберите хотя бы один канал");
  show(await api(`/items/${current.id}/approve`,{version:current.version,channels}));await list();notice("Версия одобрена для dry-run. Можно скачать пакет.");});
$("reject").onclick=()=>run(async()=>{show(await api(`/items/${current.id}/reject`,{version:current.version}));await list();notice("Версия отклонена. Для продолжения создайте новую версию.");});
$("export").onclick=()=>run(async()=>{const payload=await api(`/items/${current.id}/dry-run`,{version:current.version});
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download=`hoptrip-draft-${current.id}-v${current.version}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  show(await api(`/items/${current.id}`));notice("Пакет скачан. В соцсети ничего не отправлено.");});
window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue="";}});
run(async()=>{try{await enter(await api("/session"));}catch{showLogin();}});
