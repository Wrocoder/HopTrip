import "server-only";
import {readFile} from "node:fs/promises";
import {connection} from "next/server";

type Operator={name:string;address:string;country:string;email:string};
export async function readOperator():Promise<Operator|null> {
 await connection(); // Never put runtime personal details in prerender/build output.
 const file=process.env.HOPTRIP_OPERATOR_FILE;
 if(!file) return null;
 try {
  const value=JSON.parse(await readFile(file,"utf8"));
  for(const key of ["name","address","country","email"]) {
   if(typeof value?.[key]!=="string" || !value[key].trim() || value[key].length>500) return null;
  }
  if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.email)) return null;
  return {name:value.name,address:value.address,country:value.country,email:value.email};
 } catch {return null;} // Do not log file contents or personal data on failure.
}
