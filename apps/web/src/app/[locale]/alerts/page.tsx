import {translatedRouteLocale} from "../../../lib/i18n/server";
import AlertsPage,{generateMetadata as alertMetadata} from "../../alerts/page";
type Props={params:Promise<{locale:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({params}:Props) {
 return alertMetadata({locale:translatedRouteLocale((await params).locale)});
}
export default async function LocalizedAlerts({params,searchParams}:Props) {
 return <AlertsPage locale={translatedRouteLocale((await params).locale)} searchParams={searchParams}/>;
}
