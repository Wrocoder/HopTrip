import Link from "next/link";
import {pl} from "../lib/pl";
export default function NotFound() {return <main className="page-shell"><div className="state-panel"><p className="eyebrow">HopTrip · 404</p><h1>{pl.notFound}</h1><Link className="button" href="/">{pl.home}</Link></div></main>;}
