import {notFound} from "next/navigation";
import {translatedRouteLocale} from "../../../../lib/i18n/server";
import {isServiceSlug} from "../../../../lib/i18n/service-content";
import {ServiceInfo,serviceMetadata} from "../../../components/service-info";
type Props={params:Promise<{locale:string;slug:string}>};
export async function generateMetadata({params}:Props) {
 const {locale,slug}=await params;
 const language=translatedRouteLocale(locale);
 if(!isServiceSlug(slug))notFound();
 return serviceMetadata(slug,language);
}
export default async function LocalizedServiceInfo({params}:Props) {
 const {locale,slug}=await params;
 const language=translatedRouteLocale(locale);
 if(!isServiceSlug(slug))notFound();
 return <ServiceInfo slug={slug} locale={language}/>;
}
