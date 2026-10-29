import type {Locale} from './config';
import translated from './activity-copy.json';
const data:Record<string,{en:string;ru:string;uk:string}>=translated;
export function activityText(locale:Locale,text:string){
 if(locale==='pl')return text;
 const value=data[text]?.[locale];
 if(!value)throw new Error(`Missing activity translation: ${locale}: ${text}`);
 return value;
}
