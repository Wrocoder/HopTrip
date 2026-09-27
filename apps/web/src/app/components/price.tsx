import "server-only";
import {Suspense} from "react";
import {approximateEuro, getEurRate} from "../../lib/exchange-rate";
import {money} from "../../lib/pl";

async function EuroPrice({value}:{value:string|null}) {
  const rate = await getEurRate();
  const euro = approximateEuro(value, rate);
  if (!rate || !euro) return null;
  const explanation = `Orientacyjnie ${euro}. Średni kurs NBP z ${rate.date}: 1 EUR = ${rate.plnPerEuro} PLN. Kurs płatności może się różnić.`;
  return <small className="price-eur" title={explanation} aria-label={explanation}>≈ {euro}</small>;
}

export function Price({value}:{value:string|null}) {
  return <>{money(value)} <Suspense fallback={null}><EuroPrice value={value}/></Suspense></>;
}
