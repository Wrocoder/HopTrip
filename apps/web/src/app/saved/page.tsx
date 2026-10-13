import {SavedTrips} from "../components/saved-trips";
export const metadata={title:"Zapisane wyjazdy | HopTrip",robots:{index:false,follow:false},alternates:{canonical:"/saved"}};
export default function SavedPage(){return <main className="page-shell"><h1>Zapisane wyjazdy</h1><p>Plany zapisane w tej przeglądarce. Usunięcie planu z listy nie unieważnia wcześniej udostępnionego linku.</p><SavedTrips/></main>;}
