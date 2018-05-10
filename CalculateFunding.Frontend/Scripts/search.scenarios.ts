namespace calculateFunding.listTestScenarios {

    export class ScenariosSearchViewModel extends calculateFunding.search.SearchViewModel {

        public testScenarios: KnockoutObservableArray<ITestScenarioResponse> = ko.observableArray([]);

        constructor() {
            super();

            let self = this;

            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            this.selectedSearchFilters = ko.computed(() => {

                return [];
            });
        }

        public performSearch(pageNumber: number = null): void {
            let self = this;

            super.makeSearchResultAndProcess("/api/scenarios/search", pageNumber, (resultUntyped) => {
                let result: ITestScenarioSearchResultResponse = resultUntyped;
                self.testScenarios(result.scenarios);
                self.populateCommonSearchResultProperties(result);
            });
        }

        public removeFilter(SearchFacet: calculateFunding.search.SearchFacet): void {
            throw new Error("Method not implemented");
        }
    }

    export interface ITestScenarioSearchResultResponse extends calculateFunding.common.ISearchResultResponse {
        scenarios: Array<ITestScenarioResponse>
    }

    export interface ITestScenarioResponse {
        id: string;
        name: string;
        description: string;
        specificationId: string;
        specificationName: string;
        periodName: string;
        periodId: string;
        fundingStreamNames: string[];
        fundingStreamIds: string[];
        lastUpdatedDate: Date;
        lastUpdatedDateDisplay: string;
        status: string;
    }
}