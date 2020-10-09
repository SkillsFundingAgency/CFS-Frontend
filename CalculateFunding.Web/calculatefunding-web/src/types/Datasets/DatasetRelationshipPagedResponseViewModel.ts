import {DatasetVersion} from "./DatasetVersion";
import {PagerState} from "../PagerState";

    export interface DatasetRelationshipPagedResponseViewModel {
        totalCount: number;
        startItemNumber: number;
        endItemNumber: number;
        items: DatasetVersion[];
        facets?: any;
        pagerState: PagerState;
        name:string;
        id:string;
        description:string;
    }