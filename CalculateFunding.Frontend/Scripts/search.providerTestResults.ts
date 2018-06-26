namespace calculateFunding.results.listProviderTestResults {
    export class ProviderSearchViewModel extends calculateFunding.search.SearchViewModel {
        private testScenarioId: string;
        private fundingPeriodId: string;
        private specificationId: string;

        public providerSearchResults: KnockoutObservableArray<IProviderTestResultDetailResponse> = ko.observableArray([]);

        public providerType: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedProviderTypes: KnockoutObservableArray<string> = ko.observableArray([]);

        public providerSubType: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedProviderSubTypes: KnockoutObservableArray<string> = ko.observableArray([]);

        public authority: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedLocalAuthorities: KnockoutObservableArray<string> = ko.observableArray([]);

        constructor(options: IProviderSearchViewModelConstructorParameters) {
            super();

            let self = this;

            if (typeof options === "undefined") {
                throw new Error("options is undefined")
            }

            if (options) {

                let searchFilter = new calculateFunding.search.SearchFilter();

                searchFilter.name = "testScenarioId";
                searchFilter.term = options.testScenarioId;

                if (typeof options.testScenarioId === "undefined") {
                    throw new Error("options.testScenarioId is undefined")
                }
                if (typeof options.specificationId === "undefined") {
                    throw new Error("options.specificationId is undefined")
                }
                if (typeof options.fundingPeriodId === "undefined") {
                    throw new Error("options.periodId is undefined")
                }

                self.testScenarioId = options.testScenarioId;
                self.fundingPeriodId = options.fundingPeriodId;
                self.specificationId = options.specificationId;
                

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

            self.state.subscribe((newValue) => {
                console.log("State changed: ", newValue);
            });
         
        }

        public applyResultLabelCss(result: string): string {
            var labelCss = '';
            if (result === 'Passed') {
                labelCss = 'flag flag--success';
            } else if (result === 'Failed') {
                labelCss = 'flag flag--urgent';
            }
            else {
                labelCss = 'flag flag--soon';
            }

            return labelCss;
        }

        public performSearch(pageNumber?: number): void {
            let self = this;

            super.makeSearchResultAndProcess("/api/tests/search-providers-results", pageNumber, (resultUntyped) => {
                let result: IProviderTestSearchResultResponse = resultUntyped;
                self.providerSearchResults(result.providers);
                self.populateCommonSearchResultProperties(result);

                self.populateFacets("providerType", result.facets, self.providerType);
                self.populateFacets("providerSubType", result.facets, self.providerSubType);
                self.populateFacets("localAuthority", result.facets, self.authority);
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
                } else if (fieldName === "authority") {
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
    export interface IProviderTestSearchResultResponse extends calculateFunding.common.ISearchResultResponse {
        providers: Array<IProviderTestResultDetailResponse>
        }

    export interface IProviderTestResultDetailResponse {
        id: string;
        name: string;
        upin: string;
        ukprn: string;
        urn: string;
        establishmentNumber: string;
        providerType: string;
        providerSubtype: string;
        localAuthority: string;
        dateOpened: Date;
        dateOpenedDisplay: string;
        testResult: string;
    }

    export interface IProviderSearchViewModelConstructorParameters
    {
        testScenarioId: string;
        fundingPeriodId: string;
        specificationId: string;
    }
}
    
