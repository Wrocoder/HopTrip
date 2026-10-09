"use client";
import {useState} from "react";
import {referenceCosts,referenceGrosz} from "../../lib/reference-costs";
import {getEurRate} from "../../lib/exchange-rate";

export function ReferenceCosts({destinationSlug,onApply,filled}:{destinationSlug?:string;onApply:(amount:string)=>void;filled:boolean}) {
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
    if(value===null || !rate) {setMessage("Nie można przeliczyć kwoty. Sprawdź liczbę biletów; kurs lub taryfa mogą być nieaktualne. Możesz wpisać własną kwotę.");return;}
    onApply((value/100).toFixed(2));
    setMessage(`Przeliczenie na osobę: ${selected.euroCents/100} EUR × ${quantity}. Kurs NBP z ${rate.date}: 1 EUR = ${rate.plnPerEuro} PLN. Sprawdź pozostałe dojazdy i ewentualne ulgi. Zmiana liczby biletów wymaga ponownego przeliczenia.`);
  }
  return <details className="reference-costs"><summary>Sprawdź orientacyjne koszty na miejscu</summary>
    {choices.length>0 && <div className="filters">
      <p>Podane taryfy dotyczą dorosłej osoby. Wybierz bilety dla swojego planu; pozostałe dojazdy wpisz osobno.</p>
      <label htmlFor="reference-ticket">Bilet miejski</label>
      <select id="reference-ticket" value={selection} onChange={e=>{setSelection(e.target.value);setMessage("");}}>
        {choices.map(cost=><option key={cost.id} value={cost.id}>{cost.label} — {(cost.euroCents/100).toFixed(2)} EUR</option>)}
      </select>
      <label>Liczba takich biletów na osobę za pobyt<input type="number" min="1" max="365" step="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>
      {selected && <p>{selected.notes} <a href={selected.source} target="_blank" rel="noopener noreferrer">Źródło taryfy</a> · sprawdzono {selected.checkedAt}.</p>}
      <button type="button" onClick={apply} disabled={loading||filled}>{loading ? "Przeliczanie…" : "Uzupełnij transport miejski w PLN"}</button>
      {filled && <p>Transport miejski ma już wpisaną kwotę. Aby użyć taryfy ponownie, najpierw wyczyść to pole. Ręczne kwoty pozostają zachowane.</p>}
      <p aria-live="polite">{message}</p>
    </div>}
    {(!destinationSlug || destinationSlug==="paris") && <p>Paryż: biuro turystyczne podaje orientacyjnie 15–25 EUR za lunch w bistro oraz 25–45 EUR za wieczorny posiłek. To ceny posiłków, nie całego dnia. Uwzględnij śniadanie i własny plan w polu jedzenia. <a href="https://parisjetaime.com/eng/article/24-bistros-to-try-in-paris-a1614" target="_blank" rel="noopener noreferrer">Paris je t’aime — źródło</a> · sprawdzono 07.10.2026.</p>}
  </details>;
}
