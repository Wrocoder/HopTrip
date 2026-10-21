import {translatedRouteLocale} from "../../../lib/i18n/server";
import InfoIndex,{generateMetadata as indexMetadata} from "../../info/page";
type Props={params:Promise<{locale:string}>};
export async function generateMetadata({params}:Props){return indexMetadata({locale:translatedRouteLocale((await params).locale)});}
export default async function LocalizedInfoIndex({params}:Props){return <InfoIndex locale={translatedRouteLocale((await params).locale)}/>;}
