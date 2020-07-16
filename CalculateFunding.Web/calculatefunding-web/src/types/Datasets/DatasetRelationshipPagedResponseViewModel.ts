import {Author} from "../Calculations/Author";
import {Version} from "./Version";
import {PagerState} from "../PublishedProvider/PagerState";

    export interface Item {
        selectedVersion?: number;
        versions: Version[];
        id: string;
        name: string;
    }
    //
    // export interface PagerState {
    //     displayNumberOfPages: number;
    //     previousPage?: any;
    //     nextPage?: any;
    //     lastPage: number;
    //     pages: number[];
    //     currentPage: number;
    // }

    export interface DatasetRelationshipPagedResponseViewModel {
        totalCount: number;
        startItemNumber: number;
        endItemNumber: number;
        items: Item[];
        facets?: any;
        pagerState: PagerState;
    }