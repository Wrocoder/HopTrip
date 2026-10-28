import type {Locale} from "../../lib/i18n/config";
export const legalSourceUrls=[
 "https://www.oracle.com/legal/privacy/services-privacy-policy.html",
 "https://www.ovhcloud.com/pl/personal-data-protection/",
 "https://support.travelpayouts.com/hc/en-us/articles/360004121052-Privacy-Policy",
 "https://www.aviasales.com/privacy",
 "https://telegram.org/privacy",
 "https://uodo.gov.pl/",
] as const;
const labels:Record<Locale,readonly string[]>={
 pl:["Informacje dostawców i organ nadzorczy","Oracle — prywatność usług","OVHcloud — ochrona danych","Travelpayouts — prywatność","Aviasales — prywatność","Telegram — prywatność","Urząd Ochrony Danych Osobowych"],
 en:["Provider information and supervisory authority","Oracle — service privacy","OVHcloud — data protection","Travelpayouts — privacy","Aviasales — privacy","Telegram — privacy","Polish Personal Data Protection Office"],
 ru:["Информация поставщиков и надзорный орган","Oracle — конфиденциальность услуг","OVHcloud — защита данных","Travelpayouts — конфиденциальность","Aviasales — конфиденциальность","Telegram — конфиденциальность","Управление по защите персональных данных Польши"],
 uk:["Інформація постачальників і наглядовий орган","Oracle — конфіденційність послуг","OVHcloud — захист даних","Travelpayouts — конфіденційність","Aviasales — конфіденційність","Telegram — конфіденційність","Управління із захисту персональних даних Польщі"],
};
export function LegalSources({locale}:{locale:Locale}) {
 const text=labels[locale];
 return <section className="legal-sources"><h2>{text[0]}</h2><ul>{legalSourceUrls.map((href,index)=><li key={href}><a href={href}>{text[index+1]}</a></li>)}</ul></section>;
}
