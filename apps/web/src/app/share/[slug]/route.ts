import {getInfoContent,publishedInfoPages} from "../../../lib/content";
import {shareImage} from "../../../lib/share-image";

export const dynamic="force-static";
export function generateStaticParams() {return publishedInfoPages().map(([slug])=>({slug}));}
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}) {
 const page=getInfoContent((await params).slug);
 if(!page || page.draft) return new Response(null,{status:404});
 return shareImage(page);
}
