"use client";
import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {destinationImage,imageryCopy} from '../../lib/destination-imagery';
import type {Locale} from '../../lib/i18n/config';
import styles from './destination-card.module.css';

export function DestinationCard({slug,label,href,locale}:{slug:string;label:string;href:string;locale:Locale}) {
 const image=destinationImage(slug),copy=imageryCopy[locale];
 const [failed,setFailed]=useState(false);
 return <li className={styles.card}>
  <Link prefetch={false} className={styles.link} href={href} aria-label={label}>
   <span className={styles.frame}>
    {image&&!failed?<Image src={image.src} alt={image.alt[locale]} width={960} height={600}
     sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 900px) calc((100vw - 60px) / 2), (max-width: 1224px) calc((100vw - 104px) / 3), 374px"
     loading="lazy" onError={()=>setFailed(true)}/>:<span className={styles.fallback}>{copy.unavailable}</span>}
   </span>
   <span className={styles.label}>{label}<span aria-hidden="true"> →</span></span>
  </Link>
  {image&&<details className={styles.credit}><summary>{copy.photo}: {image.author}</summary>
   <p><a href={image.source} rel="noreferrer">{image.title}</a> · <a href={image.licenseUrl} rel="noreferrer">{image.license}</a><br/>{copy.edited}</p>
  </details>}
 </li>;
}
