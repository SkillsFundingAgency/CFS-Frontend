namespace calculateFunding.manageCalculations {

    export class CalculationSearchViewModel extends calculateFunding.search.SearchViewModel {
        public calculations: KnockoutObservableArray<ICalculationResponse> = ko.observableArray([]);

        public allocationLines: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedAllocationLines: KnockoutObservableArray<string> = ko.observableArray([]);

        public periods: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedPeriods: KnockoutObservableArray<string> = ko.observableArray([]);

        public fundingStreams: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedFundingStreams: KnockoutObservableArray<string> = ko.observableArray([]);

        public specifications: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedSpecifications: KnockoutObservableArray<string> = ko.observableArray([]);

        public calculationStatus: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedCalculationStatus: KnockoutObservableArray<string> = ko.observableArray([]);
        constructor() {
            super();

            let self = this;

            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            this.selectedSearchFacets = ko.computed(() => {
                let facets: Array<calculateFunding.search.SearchFacet> = [];

                super.buildSelectedSearchFacets(facets, self.selectedAllocationLines(), self.allocationLines());
                super.buildSelectedSearchFacets(facets, self.selectedPeriods(), self.periods());
                super.buildSelectedSearchFacets(facets, self.selectedFundingStreams(), self.fundingStreams());
                super.buildSelectedSearchFacets(facets, self.selectedSpecifications(), self.specifications());
                super.buildSelectedSearchFacets(facets, self.selectedCalculationStatus(), self.calculationStatus());

                return facets;
            }).extend({ throttle: 5 });

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
        }

        public performSearch(pageNumber: number = null) {
            let self = this;

            super.makeSearchResultAndProcess("/api/calculations/search", pageNumber, (resultUntyped) => {
                let result: ICalculationSearchResultResponse = resultUntyped;
                self.calculations(result.calculations);

                self.populateCommonSearchResultProperties(result);

                self.populateFacets("allocationLineName", result.facets, self.allocationLines);
                self.populateFacets("periodName", result.facets, self.periods);
                self.populateFacets("specificationName", result.facets, self.specifications);
                self.populateFacets("fundingStreamName", result.facets, self.fundingStreams);
                self.populateFacets("status", result.facets, self.calculationStatus);
            });
        }

        public removeFilter(searchFacet: calculateFunding.search.SearchFacet) {
            if (searchFacet && this.canSelectFilters()) {
                let selectedArray: KnockoutObservableArray<string> = null;
                let fieldName = searchFacet.fieldName();
                if (fieldName === "allocationLineName") {
                    selectedArray = this.selectedAllocationLines;
                } else if (fieldName === "periodName") {
                    selectedArray = this.selectedPeriods;
                } else if (fieldName === "specificationName") {
                    selectedArray = this.selectedSpecifications;
                } else if (fieldName === "fundingStreamName") {
                    selectedArray = this.selectedFundingStreams;
                } else if (fieldName === "status") {
                    selectedArray = this.selectedCalculationStatus;
                }

                if (selectedArray == null) {
                    throw new Error("Unable to find selected item array");
                }

                let itemIndex = selectedArray.indexOf(searchFacet.name());
                if (itemIndex > -1) {
                    selectedArray.splice(itemIndex, 1);
                }
            }
        }
    }

    export interface ICalculationSearchResultResponse extends calculateFunding.common.ISearchResultResponse {
        calculations: Array<ICalculationResponse>;
    }

    export interface ICalculationResponse {
        id: string;
        name: string;
        periodName: string;
        specificationName: string;
        status: string;
    }
}