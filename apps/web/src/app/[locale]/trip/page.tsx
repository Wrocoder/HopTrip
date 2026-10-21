import {translatedRouteLocale} from "../../../lib/i18n/server";
import SharedTripPage,{generateMetadata as tripMetadata} from "../../trip/page";
type Props={params:Promise<{locale:string}>;searchParams:Promise<{plan?:string|string[]}>};
export async function generateMetadata({params,searchParams}:Props) {
 return tripMetadata({searchParams,locale:translatedRouteLocale((await params).locale)});
}
export default async function LocalizedTripPage({params,searchParams}:Props) {
 return <SharedTripPage searchParams={searchParams} locale={translatedRouteLocale((await params).locale)}/>;
}
