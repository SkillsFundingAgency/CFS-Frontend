import {SearchMode} from "../SearchMode";

export interface DatasetSearchRequestViewModel
{
   pageNumber:number;
   searchTerm:string;
   errorToggle: string;
   includeFacets:boolean;
   filters:[];
   pageSize:number;
   facetCount:number;
   searchMode:SearchMode
}