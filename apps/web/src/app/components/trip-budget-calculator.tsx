"use client";
import {useLocale} from "./locale-provider";
import {budgetText} from "../../lib/i18n/budget-copy";
import {guideUi} from '../../lib/i18n/guide-ui';
import {localizedHref} from '../../lib/i18n/routing';
import {track} from "../../lib/session";
import {money} from "../../lib/pl";
import {useState} from "react";
import {calculateBudget,costFields,emptyBudget,type BudgetInput} from "../../lib/trip-budget";
import {budgetDateCounts,changeStayDate} from "../../lib/budget-draft";
import {validCalendarDate} from "../../lib/calendar-date";
import {dateCopy} from "../../lib/i18n/date-copy";
import styles from "./trip-budget-calculator.module.css";
import {ReferenceCosts} from "./reference-costs";
import {TripActions} from "./trip-actions";
import {TripDraftProvider,useTripDraft,type TripDraftProps} from "./trip-draft";
import type {TripOffer} from "../../lib/shared-trip";
import {PlannedEvents} from './planned-events';
import {plannedEventsCopy} from '../../lib/i18n/planned-events-copy';



type Props=TripDraftProps & {note?:string;destinationSlug?:string;shareOffer?:TripOffer};
export function TripBudgetCalculator(props:Props) {
 const shared=useTripDraft();
 return shared ? <BudgetCalculator {...props}/> : <TripDraftProvider {...props}><BudgetCalculator {...props}/></TripDraftProvider>;
}
function BudgetCalculator({note,destinationSlug,shareOffer}:Props) {
 const {draft,save,ready,context,storageMessage}=useTripDraft()!;
 const {locale}=useLocale();
 const planCopy=plannedEventsCopy[locale];
 const t=(text:string)=>budgetText(locale,text);
 const format=(grosz:number)=>money(String(grosz/100),locale);
 const input=draft.input;
 const [extraOpen,setExtraOpen]=useState(false);
 const result=calculateBudget(input,draft.events);
 const lineLabel=(label:string)=>label==='Wydarzenia w planie'?planCopy.budgetLine:t(label);
 const update=(key:keyof BudgetInput,value:string)=>{
  const next={...input,[key]:value};
  save({...draft,input:next,review:draft.review || (["people","nights","days"].includes(key) && input[key]!==value)});
  if(value.trim() && value!==input[key] && !calculateBudget(next).errors[key])track("BUDGET_USE");
 };
 const changeDate=(key:"start"|"end",value:string)=>save(changeStayDate(draft,key,value));
 const datesInvalid=Boolean(draft.start || draft.end) && !budgetDateCounts(draft.start,draft.end);
 const malformed=[draft.start,draft.end].some(value=>value!==''&&!validCalendarDate(value));
 const field=(key:keyof BudgetInput,label:string,hint:string,money=false)=><div className={styles.field} key={key}>
  <label htmlFor={`budget-${key}`}>{t(label)}{money ? " (PLN)" : ""}</label>
  <span id={`budget-${key}-hint`} className={styles.hint}>{hint===plannedEventsCopy.pl.remaining?planCopy.remaining:t(hint)}</span>
  <input id={`budget-${key}`} type="text" inputMode={money ? "decimal" : "numeric"}
   value={input[key]} onChange={event=>update(key,event.target.value)} maxLength={money ? 11 : 3}
   aria-invalid={Boolean(result.errors[key])}
   aria-describedby={`budget-${key}-hint${result.errors[key] ? ` budget-${key}-error` : ""}`}
   placeholder={money ? t("Nieznane") : undefined}/>
  {result.errors[key] && <span id={`budget-${key}-error`} className={styles.error}>{t(result.errors[key]!)}</span>}
 </div>;
 return <section id="calculator" tabIndex={-1} aria-labelledby="budget-heading" className={styles.calculator}>
  <h2 id="budget-heading">{t("Kalkulator budżetu podróży")}</h2>
  <p>{t("Wpisz własne kwoty w PLN. Puste pole oznacza nieznany koszt; wpisz 0, jeśli wydatek nie występuje lub jest już uwzględniony w innej pozycji.")}</p>
  <details><summary>{t("Jak liczymy koszty?")}</summary>
  {note && <p>{note}</p>}
  <p>{t("Loty obejmują wszystkie potrzebne odcinki. Ceny na osobę traktujemy jako jednakowe dla całej grupy. Dla noclegu wybierz cenę za noc albo łączną cenę pobytu dla wszystkich gości i pokoi.")}</p>
  </details>
  <p aria-live="polite">{t(storageMessage)}</p>
  <fieldset disabled={!ready} className={styles.controls}>
  <legend>{t("Twój plan podróży")}</legend>
  <div className={styles.grid}>
   <div className={styles.field}><label htmlFor="budget-start">{t("Początek pobytu (opcjonalnie)")}</label>
    <input id="budget-start" type="date" min="0001-01-01" max="9999-12-31" value={draft.start} aria-invalid={datesInvalid} aria-describedby={datesInvalid ? "budget-dates-error" : undefined} onChange={event=>changeDate("start",event.target.value)}/></div>
   <div className={styles.field}><label htmlFor="budget-end">{t("Koniec pobytu (opcjonalnie)")}</label>
    <input id="budget-end" type="date" min="0001-01-01" max="9999-12-31" value={draft.end} aria-invalid={datesInvalid} aria-describedby={datesInvalid ? "budget-dates-error" : undefined} onChange={event=>changeDate("end",event.target.value)}/></div>
  </div>
  <p className={styles.hint}>{t("Daty przeliczają noce i dni wydatków. Możesz dopasować te liczby ręcznie. Daty pobytu są wspólne z wyszukiwaniem noclegu. Nie zmieniają dat oferty lotu.")}</p>
  {datesInvalid && <p id="budget-dates-error" className={styles.error}>{malformed?dateCopy[locale].invalid:t("Uzupełnij obie daty: koniec nie może być wcześniejszy niż początek; pobyt może obejmować najwyżej 365 dni.")}</p>}
  <div className={styles.grid}>
   {field("people",draft.adultsOnly ? "Liczba dorosłych" : "Liczba osób","Od 1 do 50 osób")}
   {field("nights","Liczba nocy","Od 0 do 365 nocy")}
   {field("days","Liczba dni wydatków","Od 1 do 365 dni, także dni przylotu i odlotu")}
  </div>
  <p><label><input type="checkbox" checked={draft.adultsOnly===true} onChange={event=>save({...draft,adultsOnly:event.target.checked,review:true})}/>{t("Wszyscy podróżni są dorośli")}</label></p>
  {!draft.adultsOnly && <p>{t("Skład grupy nie jest potwierdzony jako wyłącznie dorośli. Potwierdź go, aby zastosować liczbę osób do Stay22. Dzieci i ich wiek ustaw u partnera; nie wysyłamy ich jako dorosłych.")}</p>}
  {draft.review && <div className={styles.result} data-testid="budget-review">
   <p>{t("Zmieniono daty, długość pobytu, liczbę osób lub dane oferty. Sprawdź ponownie loty, nocleg, transfery i pozostałe wpisane kwoty. Przeliczenie sumy nie potwierdza cen u sprzedawców.")}</p>
   <button type="button" className="button button-secondary" onClick={()=>save({...draft,context,review:false})}>{t("Kwoty sprawdzone dla tego planu")}</button>
  </div>}
  <ReferenceCosts destinationSlug={destinationSlug} filled={Boolean(input.local_transport.trim())}
    onApply={amount=>{if(!input.local_transport.trim()){update("local_transport",amount);setExtraOpen(true);}}}/>
  {locale!=="pl" && destinationSlug && <p><a href={localizedHref('/info/trip-budget',locale)}>{guideUi(locale,'budgetGuide')}</a></p>}
  <h3>{t("Główne koszty")}</h3>
  <div className={styles.grid}>{costFields.filter(cost=>["flight","hotel","transfers","food"].includes(cost.key)).map(cost=>cost.key!=="hotel" ? field(cost.key,cost.label,cost.hint,true) :
   <div key="hotel" className={styles.field}>
    <label htmlFor="budget-hotel-basis">{t("Jak podana jest cena noclegu?")}</label>
    <select id="budget-hotel-basis" value={input.hotel_basis} onChange={event=>update("hotel_basis",event.target.value==="stay"?"stay":"night")}>
     <option value="night">{t("Za jedną noc — cała grupa")}</option><option value="stay">{t("Za cały pobyt — cała grupa")}</option>
    </select>
    {field(input.hotel_basis==="stay"?"hotel_total":"hotel",cost.label,input.hotel_basis==="stay"
     ? "Łączna cena wszystkich nocy, gości i pokoi. Uwzględnij podatki i opłaty; tej kwoty nie mnożymy przez osoby ani noce."
     : cost.hint,true)}
    <span className={styles.hint}>{t("Oba pola pamiętają własne kwoty. Do sumy trafia tylko wybrany wariant; po zmianie dat lub liczby gości sprawdź cenę ponownie.")}</span>
   </div>)}</div>
  <details open={extraOpen} onToggle={event=>setExtraOpen(event.currentTarget.open)}><summary>{t("Dodatkowe koszty: bagaż, transport miejski, atrakcje i rezerwa")}</summary>
   <div className={styles.grid}>{costFields.filter(cost=>!["flight","hotel","transfers","food"].includes(cost.key)).map(cost=>field(cost.key,cost.label,cost.key==='activities'&&draft.events?.length?plannedEventsCopy.pl.remaining:cost.hint,true))}</div>
  </details>
  </fieldset>
  <PlannedEvents locale={locale}/>
  <div className={styles.result} role="status" aria-live="polite" aria-atomic="true">
   {!result.valid || datesInvalid ? <p>{t("Popraw zaznaczone pola i daty, aby obliczyć budżet.")}</p> : <>
    <p>{t(result.missing.length ? "Suma znanych kosztów" : "Budżet według wpisanych kosztów")}: <strong data-testid="budget-total">{format(result.total!)}</strong></p>
    <p>{t("Na osobę przy równym podziale (w zaokrągleniu):")}{" "}<strong data-testid="budget-person">{format(result.perPerson!)}</strong></p>
    {result.missing.length>0 && <p>{t("Budżet niepełny. Do uzupełnienia:")}{" "}{result.missing.map(lineLabel).join(", ")}.</p>}
   </>}
  </div>
  {result.valid && !datesInvalid && <details><summary>{t("Rozbicie kosztów całej grupy")}</summary><dl className={styles.breakdown}>
   {result.lines.map(line=><div key={line.key}><dt>{lineLabel(line.label)}</dt><dd>{line.total===null ? t("Nieznane") : format(line.total)+(line.incomplete?planCopy.plusUnknown:'')}</dd></div>)}
  </dl></details>}
  <p className={styles.hint}>{t("To twój plan kosztów, nie oferta ani rezerwacja. Sprawdź końcowe ceny u sprzedawców. Szkic jest dostępny tylko w tej przeglądarce; usunięcie danych witryny usuwa też szkice.")}</p>
  <button type="button" disabled={!ready} className="button" onClick={()=>save({version:1,input:{...emptyBudget},start:"",end:"",context,review:false})}>{t("Wyczyść kalkulator")}</button>
  {shareOffer && <TripActions offer={shareOffer} draft={draft} ready={ready}/>}
  <noscript>{t("Włącz JavaScript, aby obliczać budżet. Poradnik poniżej wyjaśnia, jak policzyć go samodzielnie.")}</noscript>
 </section>;
}
