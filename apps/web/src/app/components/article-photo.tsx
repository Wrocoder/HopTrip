'use client';
import {useState} from 'react';
import Image from 'next/image';
import type {ArticlePhoto as Photo} from '../../lib/article-imagery';
import type {Locale} from '../../lib/i18n/config';
import {articlePhotoCopy} from '../../lib/article-photo-captions';
import styles from './article-photo.module.css';

export function ArticlePhoto({image,caption,locale,placement,cityContext,deferCover=false}:{
 image:Photo;caption:string;locale:Locale;placement:'cover'|'inline';cityContext:boolean;deferCover?:boolean;
}){
 const [failed,setFailed]=useState(false),copy=articlePhotoCopy[locale];
 return <figure className={styles.figure} data-article-photo={placement}>
  <div className={styles.frame}>
   {failed?<p className={styles.fallback} role="status">{copy.unavailable}</p>:<Image
    src={image.src} alt={caption} width={image.width} height={image.height}
    sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1000px) calc(100vw - 80px), 960px"
    {...(placement==='cover'&&!deferCover?{preload:true}:{loading:'lazy' as const})}
    onError={()=>setFailed(true)}/>}
  </div>
  <figcaption className={styles.caption}>
   <span className={styles.subject}>{caption}{image.year&&<span className={styles.year}> · {image.year}</span>}</span>
   <span className={styles.credit}>{copy.photo}: © <a href={image.authorUrl} rel="noreferrer">{image.author}</a> · <a href={image.licenseUrl} rel="noreferrer">{image.license}</a></span>
   <details className={styles.details}><summary>{copy.details}</summary>
    <p><a href={image.source} rel="noreferrer">{image.title}</a></p>
    {image.attribution&&<p>{image.attribution}</p>}
    <p>{copy.edited} {image.shareAlike&&copy.adapted}</p>
    <p>{copy.context} {cityContext&&copy.city}</p>
   </details>
  </figcaption>
 </figure>;
}
