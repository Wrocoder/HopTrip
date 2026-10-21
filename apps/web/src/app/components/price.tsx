import {intlLocales,type Locale} from "../../lib/i18n/config";
import {catalogTemplate} from "../../lib/i18n/catalog-copy";
import "server-only";
import {Suspense} from "react";
import {approximateEuro, getEurRate} from "../../lib/exchange-rate";
import {money,date} from "../../lib/i18n/format";

async function EuroPrice({value,locale="pl"}:{value:string|null;locale?:Locale}) {
  const rate = await getEurRate();
  const euro = approximateEuro(value, rate,locale);
  if (!rate || !euro) return null;
  const explanation = catalogTemplate(locale,"Orientacyjnie {euro}. Średni kurs NBP z {date}: 1 EUR = {rate} PLN. Kurs płatności może się różnić.",{euro,date:date(rate.date,locale),rate:rate.plnPerEuro.toLocaleString(intlLocales[locale],{maximumFractionDigits:4})});
  return <small className="price-eur" title={explanation} aria-label={explanation}>≈ {euro}</small>;
}

export function Price({value,locale="pl"}:{value:string|null;locale?:Locale}) {
  return <>{money(value,locale)} <Suspense fallback={null}><EuroPrice value={value} locale={locale}/></Suspense></>;
}
