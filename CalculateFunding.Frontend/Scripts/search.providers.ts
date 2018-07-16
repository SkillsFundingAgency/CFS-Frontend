namespace calculateFunding.results.listProviderResults {
    /**
     * Lists providers so results can be displayed in detail on the next page - no provider test results in this model
     * */
    export class ProviderSearchViewModel extends calculateFunding.search.SearchViewModel {

        public providerSearchResults: KnockoutObservableArray<IProviderDetailResponse> = ko.observableArray([]);

        public providerType: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedProviderTypes: KnockoutObservableArray<string> = ko.observableArray([]);

        public providerSubType: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedProviderSubTypes: KnockoutObservableArray<string> = ko.observableArray([]);

        public localAuthority: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedLocalAuthorities: KnockoutObservableArray<string> = ko.observableArray([]);

        constructor() {
            super();

            let self = this;

            this.selectedSearchFacets = ko.computed(() => {
                let facets: Array<calculateFunding.search.SearchFacet> = [];

                super.buildSelectedSearchFacets(facets, self.selectedProviderTypes(), self.providerType());
                super.buildSelectedSearchFacets(facets, self.selectedProviderSubTypes(), self.providerSubType());
                super.buildSelectedSearchFacets(facets, self.selectedLocalAuthorities(), self.localAuthority());              

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

        public performSearch(pageNumber?: number): void {
            let self = this;

            super.makeSearchResultAndProcess("/api/results/searchproviders", pageNumber, (resultUntyped) => {
                let result: IProviderSearchResultResponse = resultUntyped;
                self.providerSearchResults(result.providers);
                self.populateCommonSearchResultProperties(result);

                self.populateFacets("providerType", result.facets, self.providerType);
                self.populateFacets("providerSubType", result.facets, self.providerSubType);
                self.populateFacets("authority", result.facets, self.localAuthority);
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
    export interface IProviderSearchResultResponse extends calculateFunding.common.ISearchResultResponse {
        providers: Array<IProviderDetailResponse>
        }

    export interface IProviderDetailResponse {
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
    }
}
    
