import {notFound} from "next/navigation";
import {isLocale} from "../../../lib/i18n/config";
import DealsPage,{generateMetadata as catalogMetadata} from "../../deals/page";
type Props={
 params:Promise<{locale:string}>;
 searchParams:Promise<Record<string,string|string[]|undefined>>;
};
async function language(params:Props["params"]) {
 const {locale}=await params;
 if(!isLocale(locale) || locale==="pl")notFound();
 return locale;
}
export async function generateMetadata({params,searchParams}:Props) {
 return catalogMetadata({searchParams,locale:await language(params)});
}
export default async function LocalizedDealsPage({params,searchParams}:Props) {
 return <DealsPage searchParams={searchParams} locale={await language(params)}/>;
}
