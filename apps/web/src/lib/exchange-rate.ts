export type EurRate = {plnPerEuro:number; date:string};
const DAY = 86_400_000;
const MAX_AGE = 7 * DAY;
export const NBP_EUR_URL = "https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json";

export function isFreshRate(rate:EurRate, now:number):boolean {
  const published = Date.parse(rate.date + "T00:00:00Z");
  return Number.isFinite(published) && published <= now && now - published <= MAX_AGE;
}

export function parseEurRate(value:unknown, now:number):EurRate|null {
  if (!value || typeof value !== "object") return null;
  const data = value as {code?:unknown; table?:unknown; rates?:unknown};
  if (data.code !== "EUR" || data.table !== "A" || !Array.isArray(data.rates)) return null;
  const row = data.rates[0] as {mid?:unknown; effectiveDate?:unknown}|undefined;
  if (!row || typeof row.mid !== "number" || !Number.isFinite(row.mid) || row.mid <= 0 ||
      typeof row.effectiveDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.effectiveDate)) return null;
  const rate = {plnPerEuro:row.mid, date:row.effectiveDate};
  const date = new Date(rate.date + "T00:00:00Z");
  return isFreshRate(rate, now) && date.toISOString().slice(0,10) === rate.date ? rate : null;
}

export function approximateEuro(value:string|null, rate:EurRate|null):string|null {
  if (!rate || value === null || !/^\d+(\.\d+)?$/.test(value) ||
      !Number.isFinite(rate.plnPerEuro) || rate.plnPerEuro <= 0) return null;
  const euro = Number(value) / rate.plnPerEuro;
  return Number.isFinite(euro) ? new Intl.NumberFormat("pl-PL", {
    style:"currency", currency:"EUR", minimumFractionDigits:0, maximumFractionDigits:0,
  }).format(euro) : null;
}

// One request per process/hour, shared by concurrent cards. Failed refreshes retry
// after one minute; the last valid quote is usable for at most seven days.
export function createEurRateLoader(request:typeof fetch = fetch, clock:()=>number = Date.now) {
  let saved:EurRate|null = null;
  let nextRefresh = 0;
  let pending:Promise<EurRate|null>|null = null;
  const usable = () => saved && isFreshRate(saved, clock()) ? saved : null;
  return async ():Promise<EurRate|null> => {
    if (pending) return pending;
    if (clock() < nextRefresh) return usable();
    pending = (async () => {
      try {
        const response = await request(NBP_EUR_URL, {cache:"no-store", signal:AbortSignal.timeout(2000)});
        if (!response.ok) throw new Error("NBP unavailable");
        const rate = parseEurRate(await response.json(), clock());
        if (!rate) throw new Error("Invalid NBP rate");
        saved = rate;
        nextRefresh = clock() + 3_600_000;
      } catch {
        nextRefresh = clock() + 60_000;
      }
      return usable();
    })();
    try { return await pending; } finally { pending = null; }
  };
}

export const getEurRate = createEurRateLoader();
