import {ImageResponse} from "next/og";
import {readFile} from "node:fs/promises";
import {join} from "node:path";

// Original vector travel illustration; no third-party image or runtime image host.
export async function travelPreview(title:string,subtitle:string) {
  const font=await readFile(join(process.cwd(),"src/app/fonts/DMSans-Preview.ttf"));
  return new ImageResponse(<div style={{display:"flex",width:"100%",height:"100%",background:"#F5F7F2",fontFamily:"DM Sans",color:"#1F302E",padding:56}}>
    <div style={{display:"flex",flexDirection:"column",width:760,justifyContent:"space-between"}}>
      <div style={{fontSize:36,color:"#245C40",fontWeight:700}}>HopTrip ↗</div>
      <div style={{display:"flex",fontSize:title.length>60 ? 48 : 64,fontWeight:700,lineHeight:1.12,overflowWrap:"break-word"}}>{title}</div>
      <div style={{display:"flex",fontSize:26,color:"#4E625D",lineHeight:1.4}}>{subtitle}</div>
      <div style={{fontSize:20,color:"#245C40"}}>Lot · nocleg · plan podróży</div>
    </div>
    <div style={{display:"flex",width:300,alignItems:"center",marginLeft:24}}>
      <svg width="300" height="460" viewBox="0 0 300 460">
        <rect x="0" y="0" width="300" height="460" rx="145" fill="#D9E8D7"/>
        <circle cx="220" cy="100" r="40" fill="#F2CF72"/>
        <path d="M20 365 L20 280 L65 280 L65 235 L110 235 L110 170 L145 205 L180 170 L180 290 L230 250 L280 285 L280 365 Z" fill="#38734E"/>
        <path d="M100 365 L100 330 Q145 270 190 330 L190 365 M20 385 H280" fill="none" stroke="#F5F7F2" strokeWidth="12"/>
        <path d="M45 160 L245 95 L160 195 L133 151 L45 160 Z M133 151 L245 95" fill="#F5F7F2" stroke="#245C40" strokeWidth="4" strokeLinejoin="round"/>
      </svg>
    </div>
  </div>,{width:1200,height:630,fonts:[{name:"DM Sans",data:font,style:"normal",weight:700}],
    headers:{"Cache-Control":"public, max-age=300, s-maxage=300","X-Robots-Tag":"noindex"}});
}
