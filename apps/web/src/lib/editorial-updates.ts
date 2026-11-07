// Actual bounded editorial changes, not a clock-based freshness signal.
const edited:Readonly<Record<string,string>>={
 '/info/alicante-airport':'2026-11-07','/info/malaga-airport':'2026-11-07','/info/lisbon-airport':'2026-11-07',
 '/info/alicante-weekend':'2026-11-07','/info/malaga-weekend':'2026-11-07','/info/lisbon-3-days':'2026-11-07',
 '/info/rome-3-days':'2026-11-07','/info/rome-airports':'2026-11-07',
 '/from/KRK':'2026-11-07','/tanie-loty-na-weekend':'2026-11-07',
};
export function editorialLastModified(path:string,reviewedAt?:string):string|undefined{
 const changed=Object.hasOwn(edited,path)?edited[path]:undefined;
 return changed&&(!reviewedAt||changed>reviewedAt)?changed:reviewedAt;
}
