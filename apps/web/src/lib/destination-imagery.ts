import type {Locale} from './i18n/config.ts';
import photos from './article-photo-data.json' with {type:'json'};
import {articlePhotoCaption} from './article-photo-captions.ts';

type DestinationImage={src:string;width:number;height:number;title:string;author:string;source:string;license:string;licenseUrl:string;alt:Record<Locale,string>;authorUrl?:string;attribution?:string;shareAlike?:boolean};
// Reuse reviewed local city photographs and their attribution, never generic article covers.
const cityPhotoKeys={
 paris:'paris',milan:'milan',stockholm:'stockholm',oslo:'oslo',lisbon:'lisbon',athens:'athens',
 london:'london',madrid:'madrid',valencia:'valencia',alicante:'alicante',malaga:'malaga',porto:'porto',
 vienna:'vienna',prague:'prague',copenhagen:'copenhagen',amsterdam:'amsterdam',
 wroclaw:'wroclaw',warsaw:'warsaw',krakow:'krakow',gdansk:'gdansk',katowice:'katowice',poznan:'poznan',
 // These country article covers depict these specific cities, not other destinations in the country.
 bergen:'norway',reykjavik:'iceland',
} as const satisfies Record<string,keyof typeof photos>;
const cityImages:Record<string,DestinationImage>=Object.fromEntries(Object.entries(cityPhotoKeys).map(([slug,key])=>[slug,{
 ...photos[key],alt:{pl:articlePhotoCaption(key,'pl'),en:articlePhotoCaption(key,'en'),ru:articlePhotoCaption(key,'ru'),uk:articlePhotoCaption(key,'uk')},
}]));
// Editorial images only: this allowlist never changes catalog eligibility or ranking.
export const destinationImages:Readonly<Record<string,DestinationImage>>={
 ...cityImages,
 barcelona:{src:'/media/destinations/barcelona.webp',width:960,height:600,title:'Parc guell - panoramio.jpg',author:'essetefano',
  source:'https://commons.wikimedia.org/wiki/File:Parc_guell_-_panoramio.jpg',license:'CC BY 3.0',licenseUrl:'https://creativecommons.org/licenses/by/3.0/',
  alt:{pl:'Pawilony wejściowe Parku Güell z panoramą Barcelony',en:'Entrance pavilions of Park Güell overlooking Barcelona',ru:'Входные павильоны парка Гуэль на фоне Барселоны',uk:'Вхідні павільйони парку Ґуель на тлі Барселони'}},
 rome:{src:'/media/destinations/rome.webp',width:960,height:600,title:'Panorama Kolosseum in Rom (Originalgröße).jpg',author:'Sebastian Straub',
  source:'https://commons.wikimedia.org/wiki/File:Panorama_Kolosseum_in_Rom_(Originalgr%C3%B6%C3%9Fe).jpg',license:'CC BY 3.0',licenseUrl:'https://creativecommons.org/licenses/by/3.0/',
  alt:{pl:'Wnętrze Koloseum w Rzymie',en:'Interior of the Colosseum in Rome',ru:'Внутренний вид Колизея в Риме',uk:'Внутрішній вигляд Колізею в Римі'}},
 budapest:{src:'/media/destinations/budapest.webp',width:960,height:600,title:'Budapest.Parliament.jpg',author:'Padrag',
  source:'https://commons.wikimedia.org/wiki/File:Budapest.Parliament.jpg',license:'CC BY 2.5',licenseUrl:'https://creativecommons.org/licenses/by/2.5/',
  alt:{pl:'Budynek parlamentu w Budapeszcie widziany znad Dunaju',en:'Hungarian Parliament Building in Budapest seen across the Danube',ru:'Здание парламента в Будапеште со стороны Дуная',uk:'Будівля парламенту в Будапешті з боку Дунаю'}},
};
export function destinationImage(slug:string):DestinationImage|undefined {
 return Object.hasOwn(destinationImages,slug)?destinationImages[slug]:undefined;
}
export const imageryCopy:Record<Locale,{photo:string;edited:string;unavailable:string}>={
 pl:{photo:'Zdjęcie',edited:'Przycięte i zmniejszone; format WebP.',unavailable:'Zdjęcie niedostępne'},
 en:{photo:'Photo',edited:'Cropped and resized; WebP format.',unavailable:'Photo unavailable'},
 ru:{photo:'Фото',edited:'Кадрировано и уменьшено; формат WebP.',unavailable:'Фото недоступно'},
 uk:{photo:'Фото',edited:'Кадровано та зменшено; формат WebP.',unavailable:'Фото недоступне'},
};
