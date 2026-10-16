import DealsPage,{generateMetadata as catalogMetadata} from "../../deals/page";
export const dynamic="force-dynamic";
type Props={searchParams:Promise<Record<string,string|string[]|undefined>>};
export const generateMetadata=(props:Props)=>catalogMetadata({...props,path:"/routes/krakow-rome"});
export default function Page(props:Props){return <DealsPage {...props} path="/routes/krakow-rome"/>;}
