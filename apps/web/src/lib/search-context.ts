import {searchFilters,searchUrl} from './search-policy.ts';

// Only catalog filters can travel back from an offer; never accept a redirect URL.
export function searchReturnPath(value:unknown):string {
 if(typeof value!=='string' || value.length>3000 || !/^\/deals(?:\?|$)/.test(value) || /[\\\u0000-\u0020]/.test(value))return '/deals';
 const query=value.includes('?') ? value.slice(value.indexOf('?')+1).split('#')[0] : '';
 return searchUrl('/deals',searchFilters(Object.fromEntries(new URLSearchParams(query))));
}
