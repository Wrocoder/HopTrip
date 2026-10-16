import DealsPage,{generateMetadata as catalogMetadata} from "../deals/page";
export const dynamic="force-dynamic";
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
export const generateMetadata=(props:Props)=>catalogMetadata({...props,path:"/city-break"});
export default function Page(props:Props){return <DealsPage {...props} path="/city-break"/>;}
