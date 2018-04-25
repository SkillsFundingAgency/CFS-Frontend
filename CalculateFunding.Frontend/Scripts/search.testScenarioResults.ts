namespace calculateFunding.testScenarioResults {

    export class TestScenarioResultsSearchViewModel extends calculateFunding.search.SearchViewModel {
        public testScenarioResults: KnockoutObservableArray<ITestScenarioResponse> = ko.observableArray([]);

        public specifications: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedSpecificationId: KnockoutObservable<string> = ko.observable();

        public selectedPeriodId: KnockoutObservable<string> = ko.observable();

        public searchCompleted: (resultUntyped: any) => void;

        constructor() {
            super();

            let self = this;

            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            this.selectedSearchFacets = ko.computed(() => {
                let facets: Array<calculateFunding.search.SearchFacet> = [];

                //super.buildSelectedSearchFacets(facets, self.selectedSpecificationId(), self.specifications());
                //super.buildSelectedSearchFacets(facets, self.selectedPeriods(), self.periods());
                //super.buildSelectedSearchFacets(facets, self.selectedFundingStreams(), self.fundingStreams());
                //super.buildSelectedSearchFacets(facets, self.selectedSpecifications(), self.specifications());
                //super.buildSelectedSearchFacets(facets, self.selectedCalculationStatus(), self.calculationStatus());

                return facets;
            }).extend({ throttle: 5 });

            this.selectedSearchFilters = ko.computed(() => {
                let filters: Array<calculateFunding.search.SearchFilter> = [];

                if (self.selectedSpecificationId()) {
                    let specFilter = new calculateFunding.search.SearchFilter();
                    specFilter.name = ko.observable("specificationId");
                    specFilter.term = self.selectedSpecificationId;
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

            self.state.subscribe((newValue) => {
                console.log("State changed: ", newValue);
            });

            self.selectedSpecificationId.subscribe((newValue: string) => {
                self.performSearch(self.pageNumber());
            });

            self.searchCompleted = (resultUntyped: any) => {
                if (resultUntyped) {
                    let result: ITestScenarioResultsResponse = resultUntyped;
                    self.testScenarioResults(result.testResults);

                    self.populateCommonSearchResultProperties(result);
                }
            }

            self.selectedPeriodId.subscribe((newValue) => {
                if (newValue) {

                }
            });
        }

        public performSearch(pageNumber: number = null) {
            let self = this;

            super.makeSearchResultAndProcess("/api/results/testscenarios", pageNumber, (resultUntyped) => {
                let result: ITestScenarioResultsResponse = resultUntyped;
                self.testScenarioResults(result.testResults);

                self.populateCommonSearchResultProperties(result);

                //self.populateFacets("", result.facets, self.allocationLines);
                //self.populateFacets("periodName", result.facets, self.periods);
                //self.populateFacets("specificationName", result.facets, self.specifications);
                //self.populateFacets("fundingStreamName", result.facets, self.fundingStreams);
                //self.populateFacets("status", result.facets, self.calculationStatus);
            });
        }

        public removeFilter(searchFacet: calculateFunding.search.SearchFacet) {
            //if (searchFacet && this.canSelectFilters()) {
            //    let selectedArray: KnockoutObservableArray<string> = null;
            //    let fieldName = searchFacet.fieldName();
            //    if (fieldName === "allocationLineName") {
            //        selectedArray = this.selectedAllocationLines;
            //    } else if (fieldName === "periodName") {
            //        selectedArray = this.selectedPeriods;
            //    } else if (fieldName === "specificationName") {
            //        selectedArray = this.selectedSpecifications;
            //    } else if (fieldName === "fundingStreamName") {
            //        selectedArray = this.selectedFundingStreams;
            //    } else if (fieldName === "status") {
            //        selectedArray = this.selectedCalculationStatus;
            //    }

            //    if (selectedArray == null) {
            //        throw new Error("Unable to find selected item array");
            //    }

            //    let itemIndex = selectedArray.indexOf(searchFacet.name());
            //    if (itemIndex > -1) {
            //        selectedArray.splice(itemIndex, 1);
            //    }
            //}
        }

        public setInitialResults(response: ITestScenarioResultsResponse): void {
            if (response) {
                this.populateSearchResults(response, this.searchCompleted);
            }
        }

        public loadSpecificationsForPeriod(periodId: string) {
            let request = $.ajax({
                url: "/api/specifications-by-period/" + periodId,
                dataType: 'json'
            });

            this.state("loading");

            request.done((r) => {
                if (r) {
                    let specifications = [];
                    for (let i = 0; i < r.length; i++) {

                    }
                }
            });

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