"use client";
import {date} from "../../lib/pl";
import {useState} from "react";
import {referenceCosts,referenceGrosz} from "../../lib/reference-costs";
import {getEurRate} from "../../lib/exchange-rate";
import {useLocale} from './locale-provider';
import {intlLocales} from '../../lib/i18n/config';
import {referenceText,referenceTicket,type ReferenceKey} from '../../lib/i18n/reference-copy';

export function ReferenceCosts({destinationSlug,onApply,filled}:{destinationSlug?:string;onApply:(amount:string)=>void;filled:boolean}) {
  const {locale}=useLocale(),intl=intlLocales[locale];
  const t=(key:ReferenceKey,values?:Record<string,string>)=>referenceText(locale,key,values);
  const choices=destinationSlug ? referenceCosts.filter(cost=>cost.city===destinationSlug) : referenceCosts;
  const [selection,setSelection]=useState(choices[0]?.id ?? "");
  const [quantity,setQuantity]=useState("1");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);
  const selected=choices.find(cost=>cost.id===selection);
  if(!choices.length && destinationSlug!=="paris")return null;
  async function apply() {
    if(!selected)return;
    setLoading(true);setMessage("");
    const rate=await getEurRate();
    const value=rate ? referenceGrosz(selected,Number(quantity),rate) : null;
    setLoading(false);
    if(value===null || !rate) {setMessage(t('error'));return;}
    onApply((value/100).toFixed(2));
    setMessage(t('converted',{eur:(selected.euroCents/100).toLocaleString(intl,{minimumFractionDigits:2}),quantity,date:date(rate.date,locale),rate:rate.plnPerEuro.toLocaleString(intl,{maximumFractionDigits:4})}));
  }
  return <details className="reference-costs"><summary>{t('title')}</summary>
    {choices.length>0 && <div className="filters">
      <p>{t('intro')}</p><label htmlFor="reference-ticket">{t('ticket')}</label>
      <select id="reference-ticket" value={selection} onChange={e=>{setSelection(e.target.value);setMessage("");}}>
        {choices.map(cost=><option key={cost.id} value={cost.id}>{referenceTicket(locale,cost).label} — {(cost.euroCents/100).toLocaleString(intl,{minimumFractionDigits:2})} EUR</option>)}
      </select>
      <label>{t('quantity')}<input type="number" min="1" max="365" step="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>
      {selected && <p>{referenceTicket(locale,selected).notes} <a href={selected.source} target="_blank" rel="noopener noreferrer">{t('source')}</a> · {t('checked')} {date(selected.checkedAt,locale)}.</p>}
      <button type="button" onClick={apply} disabled={loading||filled}>{loading ? t('loading') : t('apply')}</button>
      {filled && <p>{t('filled')}</p>}
      <p aria-live="polite">{message}</p>
    </div>}
    {(!destinationSlug || destinationSlug==="paris") && <p>{t('paris')} <a href="https://parisjetaime.com/eng/article/24-bistros-to-try-in-paris-a1614" target="_blank" rel="noopener noreferrer">{t('parisSource')}</a> · {t('checked')} {date('2026-10-07',locale)}.</p>}
  </details>;
}
