import type {Deal} from '../../lib/api';
import type {Locale} from '../../lib/i18n/config';
import {connectionWarnings} from '../../lib/connections';
import styles from './connection-warnings.module.css';

export function ConnectionWarnings({deal,locale}:{deal:Deal;locale:Locale}){
 const warnings=connectionWarnings(deal,locale);
 return warnings.length?<div className={styles.warnings} data-connection-warnings>
  {warnings.map(warning=><div className="connection-warning" key={warning.key}>
   <p><strong>{warning.title}</strong></p>
   <ul>{warning.details.map(detail=><li key={detail}>{detail}</li>)}</ul>
  </div>)}
 </div>:null;
}
