import {translatedRouteLocale} from "../../../../lib/i18n/server";
import ManageAlert,{generateMetadata as alertMetadata} from "../../../alerts/[mode]/page";
type Props={params:Promise<{locale:string;mode:string}>};
export async function generateMetadata({params}:Props) {
 const {locale,mode}=await params;
 return alertMetadata({locale:translatedRouteLocale(locale),params:Promise.resolve({mode})});
}
export default async function LocalizedAlertMode({params}:Props) {
 const {locale,mode}=await params;
 return <ManageAlert locale={translatedRouteLocale(locale)} params={Promise.resolve({mode})}/>;
}
