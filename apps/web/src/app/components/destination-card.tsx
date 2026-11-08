"use client";
import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {destinationImage,imageryCopy} from '../../lib/destination-imagery';
import {articlePhotoCopy} from '../../lib/article-photo-captions';
import type {Locale} from '../../lib/i18n/config';
import styles from './destination-card.module.css';

export function DestinationPhoto({slug,locale}:{slug:string;locale:Locale}) {
 const image=destinationImage(slug),copy=imageryCopy[locale];
 const [failed,setFailed]=useState(false);
 return <span className={styles.frame}>
    {image&&!failed?<Image src={image.src} alt={image.alt[locale]} width={image.width} height={image.height}
     sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 900px) calc((100vw - 60px) / 2), (max-width: 1224px) calc((100vw - 104px) / 3), 374px"
     loading="lazy" onError={()=>setFailed(true)}/>:<span className={styles.fallback}>{copy.unavailable}</span>}
   </span>;
}

export function DestinationPhotoCredit({slug,locale}:{slug:string;locale:Locale}) {
 const image=destinationImage(slug),copy=imageryCopy[locale];
 return image?<details className={styles.credit}><summary>{copy.photo}: {image.author}</summary>
   {image.authorUrl&&<p><a href={image.authorUrl} rel="noreferrer">{image.author}</a></p>}
   <p><a href={image.source} rel="noreferrer">{image.title}</a> · <a href={image.licenseUrl} rel="noreferrer">{image.license}</a><br/>{copy.edited}</p>
   {image.attribution&&<p>{image.attribution}</p>}
   {image.shareAlike&&<p>{articlePhotoCopy[locale].adapted}</p>}
  </details>:null;
}

export function DestinationCard({slug,label,href,locale}:{slug:string;label:string;href:string;locale:Locale}) {
 return <li className={styles.card}>
  <Link prefetch={false} className={styles.link} href={href} aria-label={label}>
   <DestinationPhoto key={slug} slug={slug} locale={locale}/>
   <span className={styles.label}>{label}<span aria-hidden="true"> →</span></span>
  </Link>
  <DestinationPhotoCredit slug={slug} locale={locale}/>
 </li>;
}
