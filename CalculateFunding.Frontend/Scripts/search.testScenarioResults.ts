namespace calculateFunding.testScenarioResults {

    export class TestScenarioResultsSearchViewModel extends calculateFunding.search.SearchViewModel {
        public testScenarioResults: KnockoutObservableArray<ITestScenarioResponse> = ko.observableArray([]);

        public specifications: KnockoutObservableArray<ISpecification> = ko.observableArray([]);
        public selectedSpecificationId: KnockoutObservable<string> = ko.observable("");

        // Set default value to empty string, so subscribe won't trigger a search request on initial page request
        public selectedPeriodId: KnockoutObservable<string> = ko.observable("");

        // Callback when search has been performed, used for ajax and initial page load
        private searchCompleted: (resultUntyped: any) => void;

        constructor() {
            super();

            let self = this;

            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            this.selectedSearchFacets = ko.computed(() => {
                return [];

            }).extend({ throttle: 5 });

            this.selectedSearchFilters = ko.computed(() => {
                let filters: Array<calculateFunding.search.SearchFilter> = [];

                if (self.selectedSpecificationId()) {
                    let specFilter = new calculateFunding.search.SearchFilter();
                    specFilter.name = "specificationId";
                    specFilter.term = self.selectedSpecificationId();
                    filters.push(specFilter);
                }

                return filters;
            })

            this.selectedSearchFacetsString = ko.pureComputed(() => {
                let result: Array<Object> = [];

                ko.utils.arrayForEach(self.selectedSearchFacets(), (facet: calculateFunding.search.SearchFacet, i: number) => {
                    let item = {
                        n: facet.name(),
                        f: facet.fieldName(),
                    }

                    result.push(item);
                });

                return JSON.stringify(result);
            }).extend({ throttle: 5 });

            self.selectedSearchFacetsString.subscribe((newValue) => {
                self.performSearch();
                console.log("Selected search facets string:", newValue);
            });

            self.selectedPeriodId.subscribe((newValue) => {
                if (self.state() === "idle") {
                    self.performSearch(1);
                }
            });

            self.selectedSpecificationId.subscribe((newValue: string) => {
                self.performSearch(1);
            });

            self.searchCompleted = (resultUntyped: any) => {
                if (resultUntyped) {
                    let result: ITestScenarioResultsResponse = resultUntyped;
                    self.testScenarioResults(result.testResults);

                    self.populateCommonSearchResultProperties(result);

                    if (typeof result.specifications !== "undefined" && result.specifications) {
                        this.specifications(result.specifications);
                    }
                }
            }
        }

        public performSearch(pageNumber: number = null) {
            let self = this;

            let additionalAjaxQueryOptions = {
                specificationId: self.selectedSpecificationId(),
                periodId: self.selectedPeriodId()
            };

            super.makeSearchResultAndProcess("/api/results/testscenarios", pageNumber, self.searchCompleted, additionalAjaxQueryOptions);
        }

        /**
         * Sets the initial result (from PageModel via CSHTML of JSON Ajax payload)
         * @param response
         */
        public setInitialResults(response: ITestScenarioResultsResponse): void {
            if (response) {
                this.populateSearchResults(response, this.searchCompleted);

                if (typeof response.specifications !== "undefined" && response.specifications) {
                    this.specifications(response.specifications);
                }
            }
        }

        public removeFilter(searchFacet: search.SearchFacet): void {
            throw new Error("Method not implemented and required for this page.");
        }

    }

    export interface ITestScenarioResultsResponse extends calculateFunding.common.ISearchResultResponse {
        testResults: Array<ITestScenarioResponse>;
        specifications: Array<ISpecification>;
        periodId: string;
    }

    export interface ITestScenarioResponse {
        id: string;
        name: string;
        failures: string;
        passes: string;
        lastUpdatedDate: string;
        lastUpdatedDataDisplay: string;
    }

    export interface ISpecification {
        id: string;
        name: string;
    }
}