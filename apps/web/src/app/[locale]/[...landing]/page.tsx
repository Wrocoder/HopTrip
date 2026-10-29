import {notFound} from "next/navigation";
import {isLocale} from "../../../lib/i18n/config";
import {landingPaths} from "../../../lib/i18n/landing-copy";
import DealsPage,{generateMetadata as dealsMetadata} from "../../deals/page";
import AirportPage,{generateMetadata as airportMetadata} from "../../from/[iata_code]/page";
import DestinationPage,{generateMetadata as destinationMetadata} from "../../destinations/[slug]/page";

export const dynamic="force-dynamic";
type Props={params:Promise<{locale:string;landing:string[]}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
async function route(params:Props["params"]) {
 const {locale,landing}=await params,path=`/${landing.join("/")}`;
 if(!isLocale(locale) || locale==="pl" || !landingPaths.includes(path))notFound();
 return {locale,path};
}
export async function generateMetadata({params,searchParams}:Props) {
 const {locale,path}=await route(params);
 if(["/from/WRO","/from/KRK"].includes(path))return airportMetadata({params:Promise.resolve({iata_code:path.split("/")[2]}),locale});
 if(path==="/destinations/milan")return destinationMetadata({params:Promise.resolve({slug:"milan"}),locale});
 return dealsMetadata({searchParams,path,locale});
}
export default async function LandingPage({params,searchParams}:Props) {
 const {locale,path}=await route(params);
 if(["/from/WRO","/from/KRK"].includes(path))return <AirportPage params={Promise.resolve({iata_code:path.split("/")[2]})} locale={locale}/>;
 if(path==="/destinations/milan")return <DestinationPage params={Promise.resolve({slug:"milan"})} locale={locale}/>;
 return <DealsPage searchParams={searchParams} path={path} locale={locale}/>;
}
