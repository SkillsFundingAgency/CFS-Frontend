namespace calculateFunding.datasetDefinitions {

    export class DatasetDefinitionSearchViewModel extends calculateFunding.search.SearchViewModel {
        public datasetDefinitions: KnockoutObservableArray<IDatasetDefinitionResponse> = ko.observableArray([]);

        // Callback when search has been performed, used for ajax and initial page load
        private searchCompleted: (resultUntyped: any) => void;

        constructor() {
            super();

            let self = this;

            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            this.selectedSearchFacets = ko.computed(() => {
                let facets: Array<calculateFunding.search.SearchFacet> = [];

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

            self.searchCompleted = (resultUntyped: any) => {
                if (resultUntyped) {
                    let result: IDatasetDefinitionSearchResultResponse = resultUntyped;
                    self.datasetDefinitions(result.datasetDefinitions);

                    self.populateCommonSearchResultProperties(result);

                    //self.populateFacets("status", result.facets, self.statuses);
                    //self.populateFacets("fundingPeriodName", result.facets, self.fundingPeriods);
                    //self.populateFacets("fundingStreamNames", result.facets, self.fundingStreams);
                }
            }
        }

        public performSearch(pageNumber: number = null) {
            let self = this;

            super.makeSearchResultAndProcess("/api/dataset-definitions/search", pageNumber, self.searchCompleted, {includeFacets: false});
        }

        /**
        * Sets the initial result (from PageModel via cshtml of JSON Ajax payload)
        * @param response
        */
        public setInitialResults(response: IDatasetDefinitionSearchResultResponse): void {
            if (response) {
                this.populateSearchResults(response, this.searchCompleted);

                if (typeof response.datasetDefinitions !== "undefined" && response.datasetDefinitions) {
                    this.datasetDefinitions(response.datasetDefinitions);
                }
            }
        }

        public removeFilter(searchFacet: calculateFunding.search.SearchFacet) {
            if (searchFacet && this.canSelectFilters()) {
                //let selectedArray: KnockoutObservableArray<string> = null;
                //let fieldName = searchFacet.fieldName();
                //if (fieldName === "status") {
                //    selectedArray = this.selectedStatuses;
                //} else if (fieldName === "fundingPeriodName") {
                //    selectedArray = this.selectedFundingPeriods;
                //} else if (fieldName === "fundingStreamNames") {
                //    selectedArray = this.selectedFundingStreams;
                //}

                //if (selectedArray == null) {
                //    throw new Error("Unable to find selected item array");
                //}

                //let itemIndex = selectedArray.indexOf(searchFacet.name());
                //if (itemIndex > -1) {
                //    selectedArray.splice(itemIndex, 1);
                //}
            }
        }

        public removeFilters(vm: DatasetDefinitionSearchViewModel, e :JQuery.Event<HTMLElement, null>) {
            //this.selectedFundingPeriods([]);
            //this.selectedFundingStreams([]);
            //this.selectedStatuses([]);

            e.preventDefault();
        }

        public statusCssClass(status: string): string {
            if (!status) {
                return "";
            }

            let statusLower = status.toLocaleLowerCase();

            return "status-" + statusLower;
        }
    }

    export interface IDatasetDefinitionSearchResultResponse extends calculateFunding.common.ISearchResultResponse {
        datasetDefinitions: Array<IDatasetDefinitionResponse>;
    }

    export interface IDatasetDefinitionResponse {
        id: string;
        name: string;
        description: string;
        providerIdentifier: string;
        lastUpdatedDateFormatted: string;
        lastUpdatedTimeFormatted: string;
        lastUpdatedDate: Date;
        lastUpdatedDateDisplay: string;
    }
}