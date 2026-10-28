import Image from "next/image";
import {countryFlags} from "../../lib/country-flags";
import type {Locale} from "../../lib/i18n/config";

export function CountryFlag({code,locale="pl"}:{code?:string;locale?:Locale}) {
  const normalized=code?.trim().toUpperCase() ?? "";
  if(!Object.hasOwn(countryFlags,normalized))return null;
  return <Image className="country-flag" src={countryFlags[normalized]} width={24} height={18}
    alt="" title={new Intl.DisplayNames([locale],{type:"region"}).of(normalized)} unoptimized/>;
}
