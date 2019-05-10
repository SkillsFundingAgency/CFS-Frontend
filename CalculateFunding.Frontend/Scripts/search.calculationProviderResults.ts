namespace calculateFunding.results.listCalulationProviderResults {
    export class ProviderSearchViewModel extends calculateFunding.search.SearchViewModel {
        private calculationId: string;
        private fundingPeriodId: string;
        private specificationId: string;
        private doSearch: boolean;

        public providerSearchResults: KnockoutObservableArray<ICalculationProviderResultDetailResponse> = ko.observableArray([]);

        public providerType: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedProviderTypes: KnockoutObservableArray<string> = ko.observableArray([]);

        public providerSubType: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedProviderSubTypes: KnockoutObservableArray<string> = ko.observableArray([]);

        public authority: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedLocalAuthorities: KnockoutObservableArray<string> = ko.observableArray([]);

        public errorToggle: KnockoutObservableArray<string> = ko.observableArray(["No Error", "Errors"]);
        
        constructor(options: ICaluclationProviderResultSearchViewModelConstructorParameters) {
            super();

            let self = this;

            if (typeof options === "undefined") {
                throw new Error("options is undefined")
            }

            if (options) {

                let searchFilter = new calculateFunding.search.SearchFilter();

                searchFilter.name = "calculationId";
                searchFilter.term = options.calculationId;

                if (typeof options.calculationId === "undefined") {
                    throw new Error("options.calculationId is undefined")
                }
                if (typeof options.specificationId === "undefined") {
                    throw new Error("options.specificationId is undefined")
                }
                if (typeof options.fundingPeriodId === "undefined") {
                    throw new Error("options.fundingPeriodId is undefined")
                }
                if (typeof options.doSearch === "undefined") {
                    throw new Error("options.doSearch is undefined")
                }

                self.calculationId = options.calculationId;
                self.fundingPeriodId = options.fundingPeriodId;
                self.specificationId = options.specificationId;
                self.doSearch = options.doSearch;

                self.selectedSearchFilters = ko.computed(() => {
                    return [
                        searchFilter
                    ]
                })
            }

            this.selectedSearchFacets = ko.computed(() => {
                let facets: Array<calculateFunding.search.SearchFacet> = [];

                super.buildSelectedSearchFacets(facets, self.selectedProviderTypes(), self.providerType());
                super.buildSelectedSearchFacets(facets, self.selectedProviderSubTypes(), self.providerSubType());
                super.buildSelectedSearchFacets(facets, self.selectedLocalAuthorities(), self.authority());
                
                return facets;
            }).extend({ throttle: 3 });

            
            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === "idle";
            });

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

            self.selectedErrorToggle.subscribe((newValue) => {
                self.performSearch();
                console.log("error filter toggle:", newValue);
            });

            self.state.subscribe((newValue) => {
                console.log("State changed: ", newValue);
            });
         
        }

        public performSearch(pageNumber?: number): void {
            let self = this;

            if (!self.doSearch)
                return;

            super.makeSearchResultAndProcess("/api/results/calculation-provider-results-search", pageNumber, (resultUntyped) => {
                let result: ICalculationProviderResultSearchResultResponse = resultUntyped;
                self.providerSearchResults(result.calculationProviderResults);
                self.populateCommonSearchResultProperties(result);

                self.populateFacets("providerType", result.facets, self.providerType);
                self.populateFacets("providerSubType", result.facets, self.providerSubType);
                self.populateFacets("localAuthority", result.facets, self.authority);
                self.totalErrorCount(result.totalErrorResults);
            });
        }

        public removeFilter(searchFacet: calculateFunding.search.SearchFacet) {
            if (searchFacet && this.canSelectFilters()) {
                let selectedArray: KnockoutObservableArray<string> = null;
                let fieldName = searchFacet.fieldName();
                if (fieldName === "providerType") {
                    selectedArray = this.selectedProviderTypes;
                } else if (fieldName === "providerSubType") {
                    selectedArray = this.selectedProviderSubTypes;
                } else if (fieldName === "localAuthority") {
                    selectedArray = this.selectedLocalAuthorities;
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
    export interface ICalculationProviderResultSearchResultResponse extends calculateFunding.common.ISearchResultResponse {
        calculationProviderResults: Array<ICalculationProviderResultDetailResponse>
        }

    export interface ICalculationProviderResultDetailResponse {
        id: string;
        name: string;
        upin: string;
        ukprn: string;
        urn: string;
        providerId: string;
        establishmentNumber: string;
        providerType: string;
        providerSubtype: string;
        localAuthority: string;
        dateOpened: Date;
        dateOpenedDisplay: string;
        calculationResult: string;
        lastUpdatedDateDisplay: string;
        calculationExceptionType: string;
        calculationExceptionMessage: string;
    }

    export interface ICaluclationProviderResultSearchViewModelConstructorParameters
    {
        calculationId: string;
        fundingPeriodId: string;
        specificationId: string;
        doSearch: boolean;
    }
}
    
