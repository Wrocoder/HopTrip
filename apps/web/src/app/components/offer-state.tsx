import type {ReactNode} from 'react';

export function OfferState({kind,title,heading:Heading='h2',children,actions}:{
 kind:'loading'|'empty'|'error'|'unavailable';title:string;heading?:'h1'|'h2'|'h3';children?:ReactNode;actions?:ReactNode;
}){
 return <section className="state-panel offer-state" data-state={kind} role={kind==='error'?'alert':kind==='loading'?'status':undefined}>
  <Heading>{title}</Heading>{children}
  {actions && <div className="offer-state-actions">{actions}</div>}
 </section>;
}
