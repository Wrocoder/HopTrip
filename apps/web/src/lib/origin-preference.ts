export const originPreferenceCookie="hoptrip.origin.v1";
export function normalizedOrigin(value:unknown):string {
 return typeof value==="string" && /^[a-z]{3}$/i.test(value.trim()) ? value.trim().toUpperCase() : "";
}
