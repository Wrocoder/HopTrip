import HomePage,{generateMetadata as homeMetadata} from '../page';
import {translatedRouteLocale} from '../../lib/i18n/server';
type Props={params:Promise<{locale:string}>;searchParams:Promise<{origin?:string|string[]}>};
export async function generateMetadata({params}:Props){return homeMetadata({locale:translatedRouteLocale((await params).locale)});}
export default async function LocalizedHome({params,searchParams}:Props){return HomePage({locale:translatedRouteLocale((await params).locale),searchParams});}
