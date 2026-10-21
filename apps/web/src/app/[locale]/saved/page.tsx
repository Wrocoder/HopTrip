import {translatedRouteLocale} from "../../../lib/i18n/server";
import SavedPage,{generateMetadata as savedMetadata} from "../../saved/page";
type Props={params:Promise<{locale:string}>};
export async function generateMetadata({params}:Props) {
 return savedMetadata({locale:translatedRouteLocale((await params).locale)});
}
export default async function LocalizedSavedPage({params}:Props) {
 return <SavedPage locale={translatedRouteLocale((await params).locale)}/>;
}
