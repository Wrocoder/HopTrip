import DestinationPage,{generateMetadata as destinationMetadata} from '../../../destinations/[slug]/page';
import {translatedRouteLocale} from '../../../../lib/i18n/server';

export const dynamic='force-dynamic';
type Props={params:Promise<{locale:string;slug:string}>};
async function context(params:Props['params']){
 const {locale,slug}=await params;
 return {params:Promise.resolve({slug}),locale:translatedRouteLocale(locale)};
}
export async function generateMetadata({params}:Props){return destinationMetadata(await context(params));}
export default async function LocalizedDestination({params}:Props){return <DestinationPage {...await context(params)}/>;}
