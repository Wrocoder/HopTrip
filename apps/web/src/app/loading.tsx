import {pl} from "../lib/pl";
export default function Loading() {return <main className="page-shell" role="status"><div className="state-panel">{pl.loading}<div className="loading-line" aria-hidden="true"/></div></main>;}
