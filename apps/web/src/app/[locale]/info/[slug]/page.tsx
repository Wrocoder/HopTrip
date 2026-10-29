import {notFound} from "next/navigation";
import {translatedRouteLocale} from "../../../../lib/i18n/server";
import {isServiceSlug} from "../../../../lib/i18n/service-content";
import {ServiceInfo,serviceMetadata} from "../../../components/service-info";
import {hasGuideTranslation} from '../../../../lib/i18n/guide-slugs';
import {GuideInfo,guideMetadata} from '../../../components/guide-info';
type Props={params:Promise<{locale:string;slug:string}>};
export async function generateMetadata({params}:Props) {
 const {locale,slug}=await params;
 const language=translatedRouteLocale(locale);
 if(isServiceSlug(slug))return serviceMetadata(slug,language);
 if(!hasGuideTranslation(slug))notFound();
 return guideMetadata(slug,language);
}
export default async function LocalizedServiceInfo({params}:Props) {
 const {locale,slug}=await params;
 const language=translatedRouteLocale(locale);
 if(isServiceSlug(slug))return <ServiceInfo slug={slug} locale={language}/>;
 if(!hasGuideTranslation(slug))notFound();
 return <GuideInfo slug={slug} locale={language}/>;
}
