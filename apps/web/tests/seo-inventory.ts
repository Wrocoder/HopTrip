import inventory from '../scripts/seo-pages.json';

export const publishedPageCount=inventory.polishPaths.length+
 inventory.translatedPaths.length*(inventory.locales.length-1);
