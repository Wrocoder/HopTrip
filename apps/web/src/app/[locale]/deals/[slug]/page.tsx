import {translatedRouteLocale} from "../../../../lib/i18n/server";
import DealPage,{generateMetadata as dealMetadata} from "../../../deals/[slug]/page";
type Props={params:Promise<{locale:string;slug:string}>};
export async function generateMetadata({params}:Props) {
 const {locale,slug}=await params;
 return dealMetadata({params:Promise.resolve({slug}),locale:translatedRouteLocale(locale)});
}
export default async function LocalizedDealPage({params}:Props) {
 const {locale,slug}=await params;
 return <DealPage params={Promise.resolve({slug})} locale={translatedRouteLocale(locale)}/>;
}
