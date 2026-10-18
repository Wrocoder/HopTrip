import Image from "next/image";
import {countryFlags} from "../../lib/country-flags";
const countries=new Intl.DisplayNames(["pl"],{type:"region"});

export function CountryFlag({code}:{code?:string}) {
  const normalized=code?.trim().toUpperCase() ?? "";
  if(!Object.hasOwn(countryFlags,normalized))return null;
  return <Image className="country-flag" src={countryFlags[normalized]} width={24} height={18}
    alt="" title={countries.of(normalized)} unoptimized/>;
}
