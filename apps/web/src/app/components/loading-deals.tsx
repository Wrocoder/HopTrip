import type {Locale} from "../../lib/i18n/config";
import {getMessages} from "../../lib/i18n/messages";
export default function LoadingDeals({locale="pl"}:{locale?:Locale}) {
  return <main className="page-shell"><p className="notice" role="status" aria-live="polite">{getMessages(locale).loading}</p></main>;
}
