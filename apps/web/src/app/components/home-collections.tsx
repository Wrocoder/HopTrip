import type {HomeCollection} from '../../lib/home-collections';
import type {Locale} from '../../lib/i18n/config';
import {collectionCopy} from '../../lib/i18n/collection-copy';
import {DealCard} from './catalog';
import {DestinationPhoto,DestinationPhotoCredit} from './destination-card';
import {HomeCollectionPreview} from './home-collection-preview';
import styles from './home-collections.module.css';

export function HomeCollections({collections,locale}:{collections:HomeCollection[];locale:Locale}){
 return collections.map(collection=><HomeCollectionPreview key={collection.id} collection={collection} locale={locale}>
  <ul className={styles.grid}>{collection.offers.map(deal=><li key={deal.slug} className={styles.offer}>
   <div className={styles.cover}>
    <DestinationPhoto key={deal.destination_slug} slug={deal.destination_slug} locale={locale}/>
    <p className={styles.caption}>{collectionCopy[locale].photo}</p>
    <DestinationPhotoCredit slug={deal.destination_slug} locale={locale}/>
   </div>
   <DealCard deal={deal} locale={locale}/>
  </li>)}</ul>
 </HomeCollectionPreview>);
}
