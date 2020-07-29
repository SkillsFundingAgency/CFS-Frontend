import {Version} from "./Version";
import {PagerState} from "../PublishedProvider/PagerState";

    export interface DatasetRelationshipPagedResponseViewModel {
        totalCount: number;
        startItemNumber: number;
        endItemNumber: number;
        items: Version[];
        facets?: any;
        pagerState: PagerState;
        name:string;
        id:string;
        description:string;
    }