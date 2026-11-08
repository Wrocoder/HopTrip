import Image from "next/image";
import {countryFlags} from "../../lib/country-flags";
import type {Locale} from "../../lib/i18n/config";
import {countryLabel} from '../../lib/country-label';

export function CountryFlag({code,locale="pl"}:{code?:string;locale?:Locale}) {
  const normalized=code?.trim().toUpperCase() ?? "";
  if(!Object.hasOwn(countryFlags,normalized))return null;
  return <Image className="country-flag" src={countryFlags[normalized]} width={24} height={18}
    alt="" title={countryLabel(normalized,locale)??undefined} unoptimized/>;
}
