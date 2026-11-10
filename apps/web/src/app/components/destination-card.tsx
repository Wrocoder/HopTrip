"use client";
import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {destinationImage,imageryCopy} from '../../lib/destination-imagery';
import {articlePhotoCopy} from '../../lib/article-photo-captions';
import type {Locale} from '../../lib/i18n/config';
import styles from './destination-card.module.css';

export function DestinationPhoto({slug,locale}:{slug:string;locale:Locale}) {
 const image=destinationImage(slug);
 const [failedSource,setFailedSource]=useState<string|null>(null);
 return <span className={styles.frame}>
    {image&&failedSource!==image.src?<Image src={image.src} alt={image.alt[locale]} width={image.width} height={image.height}
     sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 900px) calc((100vw - 60px) / 2), (max-width: 1224px) calc((100vw - 104px) / 3), 374px"
     loading="lazy" onError={()=>setFailedSource(image.src)}/>:<span className={styles.fallback} data-destination-fallback aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none" focusable="false">
       <circle cx="60" cy="60" r="42"/><ellipse cx="60" cy="60" rx="20" ry="42"/>
       <path d="M18 60h84M25 36h70M25 84h70"/>
      </svg>
     </span>}
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
