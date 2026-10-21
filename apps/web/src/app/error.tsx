"use client";
import {useLocale} from "./components/locale-provider";
export default function ErrorPage({reset}:{reset:()=>void}) {
  const {messages:pl}=useLocale();
  return <main className="page-shell"><div className="state-panel"><p className="notice" role="alert">{pl.error}</p><button onClick={reset}>{pl.retry}</button></div></main>;
}
