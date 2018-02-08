namespace calculateFunding.manageDatasets {
    export class DatasetSearchViewModel {

        public state: KnockoutObservable<string> = ko.observable("idle");

        public pageNumber: KnockoutObservable<number> = ko.observable(1);

        public searchPerformed: KnockoutObservable<boolean> = ko.observable(false);

        public searchTerm: KnockoutObservable<string> = ko.observable("");

        public datasets: KnockoutObservableArray<IDatasetResponse> = ko.observableArray([]);

        public startItemNumber: KnockoutObservable<number> = ko.observable();
        public endItemNumber: KnockoutObservable<number> = ko.observable();
        public totalResults: KnockoutObservable<number> = ko.observable();

        public canPerformSearch: KnockoutComputed<boolean>;

        public pagerState: KnockoutObservable<calculateFunding.common.IPagerStateResponse> = ko.observable(null);

        public periods: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedPeriods: KnockoutObservableArray<string> = ko.observableArray([]);

        public dataSchemas: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedDataSchemas: KnockoutObservableArray<string> = ko.observableArray([]);

        public specifications: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedSpecifications: KnockoutObservableArray<string> = ko.observableArray([]);

        public status: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedStatus: KnockoutObservableArray<string> = ko.observableArray([]);

        public selectedSearchFacets: KnockoutComputed<Array<calculateFunding.search.SearchFacet>>;

        public selectedSearchFacetsString: KnockoutComputed<string>;

        public canSelectFilters: KnockoutComputed<boolean>;

        public errorMessage: KnockoutObservable<string> = ko.observable();

        constructor() {
            let self = this;

            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            this.selectedSearchFacets = ko.computed(() => {
                let facets: Array<calculateFunding.search.SearchFacet> = [];

                self.buildSelectedSearchFacets(facets, self.selectedPeriods(), self.periods());
                self.buildSelectedSearchFacets(facets, self.selectedDataSchemas(), self.dataSchemas());
                self.buildSelectedSearchFacets(facets, self.selectedSpecifications(), self.specifications());
                self.buildSelectedSearchFacets(facets, self.selectedStatus(), self.status());

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

            this.canSelectFilters = ko.pureComputed(() => {
                return self.state() === "idle";
            });
        }


        public performSearch(pageNumber: number = null) {
            if (this.state() === "idle") {
                this.state("searching");
                this.errorMessage(null);

                let queryPageNumber = 1;
                if ($.isNumeric(pageNumber) && pageNumber > 0) {
                    queryPageNumber = pageNumber;
                }

                let filters: calculateFunding.common.ISearchFilterRequest = {};
                ko.utils.arrayForEach(this.selectedSearchFacets(), (facet: calculateFunding.search.SearchFacet, i: number) => {
                    if (facet) {
                        if (!filters[facet.fieldName()]) {
                            filters[facet.fieldName()] = [];
                        }

                        filters[facet.fieldName()].push(facet.name());
                    }
                });

                let data: calculateFunding.common.ICalculationSearchRequest = {
                    pageNumber: queryPageNumber,
                    searchTerm: this.searchTerm(),
                    includeFacets: true,
                    filters: filters,
                };

                let request = $.ajax({
                    data: JSON.stringify(data),
                    url: "/api/datasets/search",
                    dataType: "json",
                    method: "POST",
                    contentType: "application/json"
                });

                let self = this;
                console.log("Starting search request");
                request.done((resultUntyped) => {
                    console.log("Search request completed");

                    let result: IDatasetSearchResultResponse = resultUntyped;
                    self.datasets(result.datasets);
                    self.startItemNumber(result.startItemNumber);
                    self.endItemNumber(result.endItemNumber);
                    self.totalResults(result.totalResults);
                    self.pagerState(result.pagerState);

                    self.pageNumber(result.pagerState.currentPage);

                    self.populateFacets("periodName", result.facets, self.periods);
                    self.populateFacets("specification", result.facets, self.specifications);
                    self.populateFacets("dataSchema", result.facets, self.dataSchemas);
                    self.populateFacets("status", result.facets, self.status);

                    this.searchPerformed(true);
                    self.state("idle");
                });

                request.fail((xhrDetails : JQuery.jqXHR<any>, errorStatus : JQuery.Ajax.ErrorTextStatus) => {
                    self.errorMessage("Request to search datasets failed. " + xhrDetails.statusText + ". Error code=" + xhrDetails.status);
                    self.state("idle");
                });
            }
        }

        public loadPage(pageNumber: number) {
            if ($.isNumeric(pageNumber)) {
                this.performSearch(pageNumber);
            }
        }

        public removeFilter(searchFacet: calculateFunding.search.SearchFacet) {
            if (searchFacet && this.canSelectFilters()) {
                let selectedArray: KnockoutObservableArray<string> = null;
                let fieldName = searchFacet.fieldName();
                if (fieldName === "periodName") {
                    selectedArray = this.selectedPeriods;
                } else if (fieldName === "specification") {
                    selectedArray = this.selectedSpecifications;
                } else if (fieldName === "dataSchema") {
                    selectedArray = this.selectedDataSchemas;
                } else if (fieldName === "status") {
                    selectedArray = this.selectedStatus;
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

        private populateFacets(filterName: string, facetResults: Array<calculateFunding.common.ISearchFacetResponse>, facetObservableArray: KnockoutObservableArray<calculateFunding.search.SearchFacet>) {
            let searchFacetResponse: calculateFunding.common.ISearchFacetResponse = ko.utils.arrayFirst(facetResults, (item: calculateFunding.common.ISearchFacetResponse) => {
                return item.name === filterName;
            });

            let facets: Array<calculateFunding.search.SearchFacet> = [];

            if (searchFacetResponse) {
                if (searchFacetResponse.facetValues) {
                    for (let i in searchFacetResponse.facetValues) {
                        let responseValue: calculateFunding.common.ISearchFacetValueResponse = searchFacetResponse.facetValues[i];
                        let facet = new calculateFunding.search.SearchFacet(responseValue.name, responseValue.count, searchFacetResponse.name);
                        facets.push(facet);
                    }
                }
            }

            let compareResult = ko.utils.compareArrays(facetObservableArray(), facets);
            if (compareResult.length > 0) {
                console.log("Updating " + filterName, compareResult);
                facetObservableArray(facets);
            }
        }

        private buildSelectedSearchFacets(existingFacets: Array<calculateFunding.search.SearchFacet>, selectedSearchFacets: Array<string>, searchFacetOptions: Array<calculateFunding.search.SearchFacet>) {
            ko.utils.arrayForEach(selectedSearchFacets, (facetName: string, index: number) => {
                if (typeof facetName !== "undefined") {
                    if (facetName) {
                        let facet = ko.utils.arrayFirst(searchFacetOptions, (f: calculateFunding.search.SearchFacet) => {
                            return f.name() == facetName;
                        });

                        if (facet) {
                            existingFacets.push(facet);
                        }
                    }
                }

            });
        }
    }

    export interface IDatasetSearchResultResponse {
        datasets: Array<IDatasetResponse>;
        currentPage: number;
        endItemNumber: 50;
        facets: Array<calculateFunding.common.ISearchFacetResponse>;
        pagerState: calculateFunding.common.IPagerStateResponse;
        startItemNumber: number;
        totalResults: number;
    }

    export interface IDatasetResponse {
        id: string;
        name: string;
        lastUpdated: Date;
        lastUpdatedDisplay: string;
        status: string;
    }
}