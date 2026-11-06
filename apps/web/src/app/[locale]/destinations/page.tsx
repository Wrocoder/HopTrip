import DestinationsPage,{generateMetadata as directoryMetadata} from '../../destinations/page';
import {translatedRouteLocale} from '../../../lib/i18n/server';
type Props={params:Promise<{locale:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
export async function generateMetadata({params,searchParams}:Props){return directoryMetadata({searchParams,locale:translatedRouteLocale((await params).locale)});}
export default async function LocalizedDestinations({params,searchParams}:Props){return <DestinationsPage searchParams={searchParams} locale={translatedRouteLocale((await params).locale)}/>;}
