import {ImageResponse} from "next/og";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import type {InfoContent} from "./info-types";

export async function shareImage(page:InfoContent) {
 const font=await readFile(join(process.cwd(),"src/app/fonts/DMSans-Preview.ttf"));
 const category=page.category==="airports" ? "LOTNISKA W POLSCE" :
  page.category==="destinations" ? "KIERUNKI PODRÓŻY" : page.category==="planning" ? "PLANOWANIE PODRÓŻY" : "JAK DZIAŁA HOPTRIP";
 return new ImageResponse(
  <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",background:"#F5F7F2",color:"#1F302E",padding:"54px 64px",fontFamily:"DM Sans"}}>
   <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:36}}>
    <span style={{fontWeight:700}}>HopTrip<span style={{color:"#38734E"}}> ↗</span></span>
    <span style={{fontSize:20,letterSpacing:2,color:"#38734E"}}>{category}</span>
   </div>
   <div style={{display:"flex",flex:1,alignItems:"center",fontSize:page.title.length>65 ? 58 : 66,lineHeight:1.12,fontWeight:700,maxWidth:1040}}>{page.title}</div>
   <div style={{display:"flex",borderTop:"2px solid #38734E",paddingTop:25,fontSize:25,color:"#4E625D",justifyContent:"space-between"}}>
    <span>Praktyczny poradnik podróżnika</span><span>Plan → podróż</span>
   </div>
  </div>,
  {width:1200,height:630,fonts:[{name:"DM Sans",data:font,style:"normal",weight:700}],
   headers:{"Cache-Control":"public, max-age=86400","X-Robots-Tag":"noindex"}},
 );
}
