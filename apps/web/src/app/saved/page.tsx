import {SavedTrips} from "../components/saved-trips";
import type {Locale} from "../../lib/i18n/config";
import {localizedHref} from "../../lib/i18n/routing";
import {tripText} from "../../lib/i18n/trip-copy";
type Props={locale?:Locale};
export function generateMetadata({locale="pl"}:Props) {
 return {title:`${tripText(locale,"Zapisane wyjazdy")} | HopTrip`,robots:{index:false,follow:false},alternates:{canonical:localizedHref("/saved",locale)}};
}
export default function SavedPage({locale="pl"}:Props) {
 return <main className="page-shell"><h1>{tripText(locale,"Zapisane wyjazdy")}</h1>
  <p>{tripText(locale,"Plany zapisane w tej przeglądarce. Usunięcie planu z listy nie unieważnia wcześniej udostępnionego linku.")}</p><SavedTrips/></main>;
}
