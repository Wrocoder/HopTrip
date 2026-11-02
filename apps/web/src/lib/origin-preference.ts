export const originPreferenceCookie="hoptrip.origin.v1";
export function normalizedOrigin(value:unknown):string {
 return typeof value==="string" && /^[a-z]{3}$/i.test(value.trim()) ? value.trim().toUpperCase() : "";
}

export type OriginSelection={value:string;select:(origin:string)=>void;onSearch?:()=>void};

export function selectedOrigin(query:unknown,stored:unknown,knownCodes:readonly string[]|null):string {
 // An explicit URL (including an empty value) wins. A failed registry request
 // cannot establish that a saved code is stale; keep it until it can be checked.
 if(query!==undefined)return normalizedOrigin(query);
 const saved=normalizedOrigin(stored);
 return knownCodes===null || knownCodes.includes(saved) ? saved : "";
}
