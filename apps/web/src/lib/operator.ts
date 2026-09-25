import "server-only";
import {readFile} from "node:fs/promises";
import {connection} from "next/server";

type Operator={email:string};
export async function readOperator():Promise<Operator|null> {
 await connection(); // Never put runtime personal details in prerender/build output.
 const file=process.env.HOPTRIP_OPERATOR_FILE;
 if(!file) return null;
 try {
  const value=JSON.parse(await readFile(file,"utf8"));
  if(typeof value?.email!=="string" || value.email.length>254) return null;
  if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.email)) return null;
  return {email:value.email}; // Never return identity/address, even from an old configuration.
 } catch {return null;} // Do not log file contents or personal data on failure.
}
