'use client';

import type {ReactNode} from 'react';
import {track} from '../../lib/session';

// Keep the disclosure's content server-rendered; only its native toggle needs JS.
export function OfferDetailsDisclosure({slug,className,children}:{slug:string;className:string;children:ReactNode}){
 return <details className={className} onToggle={event=>{
  if(event.target===event.currentTarget&&event.currentTarget.open)track('DEAL_DETAILS_OPEN',slug);
 }}>{children}</details>;
}
