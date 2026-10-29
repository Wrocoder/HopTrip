import type {Metadata} from "next";
import {translatedRouteLocale} from '../../../../lib/i18n/server';
import {GuideInfo,guideMetadata} from '../../../components/guide-info';
type Props={params:Promise<{locale:string}>};
async function language(params:Props["params"]) {
 const {locale}=await params;
 return translatedRouteLocale(locale);
}
export async function generateMetadata({params}:Props):Promise<Metadata> {
 const locale=await language(params);
 return guideMetadata('trip-budget',locale);
}
export default async function LocalizedBudgetPage({params}:Props) {
 return <GuideInfo slug="trip-budget" locale={await language(params)}/>;
}
