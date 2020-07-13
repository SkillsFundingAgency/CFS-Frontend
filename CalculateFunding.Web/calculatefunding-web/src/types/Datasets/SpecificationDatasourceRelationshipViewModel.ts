import {PagerState} from "./DatasetDefinitionResponseViewModel";

export interface SpecificationDatasourceRelationshipItemViewModel {
   specificationId: string,
   specificationName: string,
   definitionRelationshipCount: number,
   fundingStreamNames: string[],
   fundingPeriodName: string
}

export interface SpecificationDatasourceRelationshipViewModel {
   items: SpecificationDatasourceRelationshipItemViewModel[]
   totalCount: number;
   startItemNumber: number;
   endItemNumber: number;
   pagerState: PagerState;
}
