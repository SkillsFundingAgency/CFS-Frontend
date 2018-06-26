namespace calculateFunding.manageDatasets {
    export class DatasetSearchViewModel extends calculateFunding.search.SearchViewModel {
        public datasets: KnockoutObservableArray<IDatasetResponse> = ko.observableArray([]);

        public dataSchemas: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedDataSchemas: KnockoutObservableArray<string> = ko.observableArray([]);

        constructor() {
            super();

            let self = this;

            this.selectedSearchFacets = ko.computed(() => {
                let facets: Array<calculateFunding.search.SearchFacet> = [];

                super.buildSelectedSearchFacets(facets, self.selectedDataSchemas(), self.dataSchemas());

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
        }

        public performSearch(pageNumber: number = null) {
            let self = this;

            super.makeSearchResultAndProcess("/api/datasets/search", pageNumber, (resultUntyped) => {
                let result: IDatasetSearchResultResponse = resultUntyped;
                self.datasets(result.datasets);

                self.populateCommonSearchResultProperties(result);

                self.populateFacets("definitionName", result.facets, self.dataSchemas);
            });
        }

        public removeFilter(searchFacet: calculateFunding.search.SearchFacet) {
            if (searchFacet && this.canSelectFilters()) {
                let selectedArray: KnockoutObservableArray<string> = null;
                let fieldName = searchFacet.fieldName();
                if (fieldName === "definitionName") {
                    selectedArray = this.selectedDataSchemas;
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

    export interface IDatasetSearchResultResponse extends calculateFunding.common.ISearchResultResponse {
        datasets: Array<IDatasetResponse>;
    }

    export interface IDatasetResponse {
        id: string;
        name: string;
        lastUpdated: Date;
        lastUpdatedDisplay: string;
        status: string;
        description: string;
        version: string;
    }
}