import {PriceAssessment} from "./price-assessment";
import Link from "next/link";
import type {Deal,ScoreExplanation} from "../../lib/api";
import {money,dateTime} from "../../lib/pl";
import {intlLocales,type Locale} from "../../lib/i18n/config";
import {localizedHref} from "../../lib/i18n/routing";
import {scoreText,type ScoreKey} from "../../lib/i18n/score-copy";

export function scoreReason(key:string,score:ScoreExplanation,locale:Locale):string {
 const t=(key:ScoreKey,values:Record<string,string|number>={})=>scoreText(locale,key,values);
 const number=(value:string|number)=>new Intl.NumberFormat(intlLocales[locale],{maximumFractionDigits:2}).format(Number(value));
 if(score.status==="LEGACY"){
  const legacy:Record<string,ScoreKey>={flight_price:"legacyPrice",historical_discount:"legacyDiscount",convenience:"legacyConvenience",freshness:"legacyFreshness",confidence:"legacyHistory"};
  return t(legacy[key]??"component",{count:score.sample_count??t("unknown")});
 }
 if(key==="price"){
  if(score.status==="PROVISIONAL")return t("provisionalPrice");
  const difference=Number(score.price_difference_percent);
  const comparison=difference===0 ? t("atMedian") : `${number(Math.abs(difference))}% ${t(difference>0 ? "below" : "above")} ${t("median")}`;
  return t("priceReason",{price:money(score.current_price_pln,locale),median:money(score.median_price_pln,locale),comparison});
 }
 if(key==="history")return t("historyReason",{count:score.sample_count??0});
 if(key==="freshness"){
  const age=score.observed_at && score.calculated_at ? (Date.parse(score.calculated_at)-Date.parse(score.observed_at))/3600000 : null;
  return (age!==null && age>=0 ? t("age",{age:number(age)}) : t("noAge"))+t("freshnessReason")+t(score.observation_basis==="FIRST_SEEN" ? "firstSeen" : "sourceTime");
 }
 return t("component");
}

export function ScoreDetails({deal,locale="pl"}:{deal:Deal;locale?:Locale}) {
 const t=(key:ScoreKey,values:Record<string,string|number>={})=>scoreText(locale,key,values);
 const number=(value:string|number)=>new Intl.NumberFormat(intlLocales[locale],{maximumFractionDigits:2}).format(Number(value));
 const labels:Record<string,ScoreKey>={price:"price",history:"history",freshness:"freshness",flight_price:"flight_price",historical_discount:"historical_discount",convenience:"convenience",confidence:"history"};
 const score=deal.score_explanation,unavailable=!score || score.status==="UNAVAILABLE";
 return <div className="score-details">
  <PriceAssessment deal={deal} locale={locale}/><p>{t("intro")}</p>
  {unavailable ? <p className="score-caution">{t("unavailable")}</p> : <>
   {score.status==="PROVISIONAL" && <p className="score-caution"><strong>{t("provisional")}</strong> {t("neutral")}</p>}
   {score.status==="LEGACY" && <p className="score-caution">{t("legacy")}</p>}
   <details className="score-method score-calculation"><summary>{t("calculation",{score:deal.deal_score})}</summary>
    <p className="score-sum"><strong>{score.parts.map(part=>number(part.points)).join(" + ")} = {number(score.total_before_rounding!)} {t("points")}</strong><br/>
     {t("rounded")} <strong>{deal.deal_score}/100</strong>.</p>
    <div className="score-parts">{score.parts.map(part=><section className="score-part" key={part.key}>
     <div className="score-part-heading"><h3>{labels[part.key] ? t(labels[part.key]) : part.key}</h3><strong>{number(part.points)} / {part.max_points} {t("points")}</strong></div>
     <div className="score-meter" aria-hidden="true"><span style={{width:`${Number(part.points)/part.max_points*100}%`}}/></div>
     <p>{scoreReason(part.key,score,locale)}</p>
    </section>)}</div>
    {score.calculated_at && <p className="muted">{t("calculated")} <time dateTime={score.calculated_at}>{dateTime(score.calculated_at,locale)}</time> {t("calculationTime")}</p>}
   </details>
  </>}
  <details className="score-method"><summary>{t("scope")}</summary><p>{t("grouping")}</p><p>{t("exclusions")}</p></details>
  <Link className="text-link" href={localizedHref("/info/price-comparison",locale)}>{t("methodology")} →</Link>
 </div>;
}
