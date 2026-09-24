export type InfoLink = {label:string;href:string};
export type InfoContent = {
 title:string;
 description?:string;
 draft:boolean;
 reviewedAt?:string;
 category?:"planning"|"airports"|"destinations";
 paragraphs:string[];
 sections?:{title:string;paragraphs:string[];sourceIds?:number[]}[];
 sources?:InfoLink[];
 routes?:InfoLink[];
 related?:string[];
};
