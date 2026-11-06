// Validate known editorial link forms without rewriting opaque attribution.
function approvedUrl(value:string):URL|null {
 if(/[\x00-\x20\\]/.test(value))return null;
 try {const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&!u.hash?u:null;}
 catch{return null;}
}
export function staticAffiliateUrl(value:string,kind:'activity'|'transfer'):string|null {
 const u=approvedUrl(value);if(!u)return null;
 if(u.hostname===(kind==='transfer'?'tpx.gr':'tiqets.tpx.gr'))return /^\/[A-Za-z0-9]+$/.test(u.pathname)&&!u.search?value:null;
 if(kind!=='activity'||u.hostname!=='tp.media'||u.pathname!=='/r')return null;
 const targets=u.searchParams.getAll('u');
 const target=targets.length===1?approvedUrl(targets[0]):null;
 if(!target||!['tiqets.com','www.tiqets.com'].includes(target.hostname))return null;
 return value;
}
