namespace calculateFunding.manageCalculations {

    export class AdditionalCalculationsSearchViewModel extends calculateFunding.search.SearchViewModel {
        public removeFilter(searchFacet: search.SearchFacet): void {
        }

        public calculations: KnockoutObservableArray<ICalculationsResponse> = ko.observableArray([]);

        public selectedSpecification: KnockoutObservable<string> = ko.observable();

        private searchCompleted: (resultUntyped: any) => void;

        constructor(specificationId: string) {
            super();

            let self = this;

            if (typeof specificationId === "undefined") {
                throw new Error("Constructor parameter variable specification id not passed");
            }

            this.selectedSpecification(specificationId);

            this.includeFacets = false;

            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            this.selectedSearchFilters = ko.computed(() => {
                let filters: Array<calculateFunding.search.SearchFilter> = [];

                let specFilter: calculateFunding.search.SearchFilter =
                {
                    name: "specificationId",
                    term: self.selectedSpecification()
                };

                filters.push(specFilter);

                let calcTypeFilter: calculateFunding.search.SearchFilter =
                {
                    name: "calculationType",
                    term: "Additional"
                };

                filters.push(calcTypeFilter);

                return filters;
            });

            self.state.subscribe((newValue) => {
                console.log("State changed: ", newValue);
            });

            self.searchCompleted = (resultUntyped: any) => {
                if (resultUntyped) {
                    let result: ICalculationsSearchResultResponse = resultUntyped;
                    if (result.calculations != null) {
                        self.calculations(result.calculations);
                    }
                    self.populateCommonSearchResultProperties(result);
                }
            }
        }

        public performSearch(pageNumber: number = null) {
            let self = this;
            self.pageSize(20);
            super.makeSearchResultAndProcess("/api/calculations/search", pageNumber, self.searchCompleted);
        }

        /**
        * Sets the initial result (from PageModel via cshtml of JSON Ajax payload)
        * @param response
        */
        public setInitialResults(response: ICalculationsSearchResultResponse): void {
            if (response) {
                this.populateSearchResults(response, this.searchCompleted);

                if (typeof response.calculations !== "undefined" && response.calculations) {
                    this.calculations(response.calculations);
                }
            }
        }

        public statusCssClass(status: string): string {
            if (!status) {
                return "";
            }

            let statusLower = status.toLocaleLowerCase();

            return "status-" + statusLower;
        }
    }

    export interface ICalculationsSearchResultResponse extends calculateFunding.common.ISearchResultResponse {
        calculations: Array<ICalculationsResponse>;
    }

    export interface ICalculationsResponse {
        id: string;
        name: string;
        status: string;
        valueType: string;
        lastUpdatedDate: Date;
        lastUpdatedDateDisplay: string
    }
}