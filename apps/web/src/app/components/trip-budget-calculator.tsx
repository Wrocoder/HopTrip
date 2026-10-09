"use client";
import {useState} from "react";
import {calculateBudget,costFields,emptyBudget,type BudgetInput} from "../../lib/trip-budget";
import styles from "./trip-budget-calculator.module.css";
import {ReferenceCosts} from "./reference-costs";

const format=(grosz:number)=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(grosz/100);

export function TripBudgetCalculator({initialInput={},note,destinationSlug}:{initialInput?:Partial<BudgetInput>;note?:string;destinationSlug?:string}) {
 const [input,setInput]=useState<BudgetInput>(()=>({...emptyBudget,...initialInput}));
 const result=calculateBudget(input);
 const update=(key:keyof BudgetInput,value:string)=>setInput(current=>({...current,[key]:value}));
 const field=(key:keyof BudgetInput,label:string,hint:string,money=false)=><div className={styles.field} key={key}>
  <label htmlFor={`budget-${key}`}>{label}{money ? " (PLN)" : ""}</label>
  <span id={`budget-${key}-hint`} className={styles.hint}>{hint}</span>
  <input id={`budget-${key}`} type="text" inputMode={money ? "decimal" : "numeric"}
   value={input[key]} onChange={event=>update(key,event.target.value)} maxLength={money ? 11 : 3}
   aria-invalid={Boolean(result.errors[key])}
   aria-describedby={`budget-${key}-hint${result.errors[key] ? ` budget-${key}-error` : ""}`}
   placeholder={money ? "Nieznane" : undefined}/>
  {result.errors[key] && <span id={`budget-${key}-error`} className={styles.error}>{result.errors[key]}</span>}
 </div>;
 return <section id="calculator" aria-labelledby="budget-heading" className={styles.calculator}>
  <h2 id="budget-heading">Kalkulator budżetu podróży</h2>
  {note && <p>{note}</p>}
  <p>Wpisz własne kwoty w PLN. Puste pole oznacza nieznany koszt; wpisz 0, jeśli wydatek nie występuje lub jest już uwzględniony w innej pozycji.</p>
  <p>Loty obejmują wszystkie potrzebne odcinki. Ceny na osobę traktujemy jako jednakowe dla całej grupy. Dla noclegu wybierz cenę za noc albo łączną cenę pobytu dla wszystkich gości i pokoi.</p>
  <div className={styles.grid}>
   {field("people","Liczba osób","Od 1 do 50 osób")}
   {field("nights","Liczba nocy","Od 0 do 365 nocy")}
   {field("days","Liczba dni wydatków","Od 1 do 365 dni, także dni przylotu i odlotu")}
  </div>
  <ReferenceCosts destinationSlug={destinationSlug} filled={Boolean(input.local_transport.trim())}
    onApply={amount=>setInput(current=>current.local_transport.trim() ? current : {...current,local_transport:amount})}/>
  <div className={styles.grid}>{costFields.map(cost=>cost.key!=="hotel" ? field(cost.key,cost.label,cost.hint,true) :
   <div key="hotel" className={styles.field}>
    <label htmlFor="budget-hotel-basis">Jak podana jest cena noclegu?</label>
    <select id="budget-hotel-basis" value={input.hotel_basis} onChange={event=>setInput(current=>({...current,hotel_basis:event.target.value==="stay"?"stay":"night"}))}>
     <option value="night">Za jedną noc — cała grupa</option><option value="stay">Za cały pobyt — cała grupa</option>
    </select>
    {field(input.hotel_basis==="stay"?"hotel_total":"hotel",cost.label,input.hotel_basis==="stay"
     ? "Łączna cena wszystkich nocy, gości i pokoi. Uwzględnij podatki i opłaty; tej kwoty nie mnożymy przez osoby ani noce."
     : cost.hint,true)}
    <span className={styles.hint}>Oba pola pamiętają własne kwoty. Do sumy trafia tylko wybrany wariant; po zmianie dat lub liczby gości sprawdź cenę ponownie.</span>
   </div>)}</div>
  <div className={styles.result} role="status" aria-live="polite" aria-atomic="true">
   {!result.valid ? <p>Popraw zaznaczone pola, aby obliczyć budżet.</p> : <>
    <p>{result.missing.length ? "Suma znanych kosztów" : "Budżet według wpisanych kosztów"}: <strong data-testid="budget-total">{format(result.total!)}</strong></p>
    <p>Na osobę przy równym podziale (w zaokrągleniu): <strong data-testid="budget-person">{format(result.perPerson!)}</strong></p>
    {result.missing.length>0 && <p>Budżet niepełny. Do uzupełnienia: {result.missing.join(", ")}.</p>}
   </>}
  </div>
  {result.valid && <details><summary>Rozbicie kosztów całej grupy</summary><dl className={styles.breakdown}>
   {result.lines.map(line=><div key={line.key}><dt>{line.label}</dt><dd>{line.total===null ? "Nieznane" : format(line.total)}</dd></div>)}
  </dl></details>}
  <p className={styles.hint}>To twój plan kosztów, nie oferta ani rezerwacja. Sprawdź końcowe ceny u sprzedawców. Obliczenia zostają w tej karcie przeglądarki; odświeżenie strony je usuwa.</p>
  <button type="button" className="button" onClick={()=>setInput({...emptyBudget})}>Wyczyść kalkulator</button>
  <noscript>Włącz JavaScript, aby obliczać budżet. Poradnik poniżej wyjaśnia, jak policzyć go samodzielnie.</noscript>
 </section>;
}
