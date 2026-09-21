"use client";
import {pl} from "../lib/pl";
export default function ErrorPage({reset}:{reset:()=>void}) {
  return <main className="page-shell"><div className="state-panel"><p className="notice" role="alert">{pl.error}</p><button onClick={reset}>{pl.retry}</button></div></main>;
}
