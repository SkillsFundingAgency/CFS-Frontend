namespace calculateFunding.manageCalculations {

    export class CalculationSearchViewModel {

        public state: KnockoutObservable<string> = ko.observable("idle");

        public pageNumber: KnockoutObservable<number> = ko.observable(1);

        public searchPerformed: KnockoutObservable<boolean> = ko.observable(false);

        public searchTerm: KnockoutObservable<string> = ko.observable("");

        public calculations: KnockoutObservableArray<ICalculationResponse> = ko.observableArray([]);

        public startItemNumber: KnockoutObservable<number> = ko.observable();
        public endItemNumber: KnockoutObservable<number> = ko.observable();
        public totalResults: KnockoutObservable<number> = ko.observable();

        public canPerformSearch: KnockoutComputed<boolean>;

        public pagerState: KnockoutObservable<IPagerStateResponse> = ko.observable(null);

        public allocationLines: KnockoutObservableArray<SearchFacet> = ko.observableArray([]);
        public selectedAllocationLines: KnockoutObservableArray<string> = ko.observableArray([]);

        public periods: KnockoutObservableArray<SearchFacet> = ko.observableArray([]);
        public selectedPeriods: KnockoutObservableArray<string> = ko.observableArray([]);

        public fundingStreams: KnockoutObservableArray<SearchFacet> = ko.observableArray([]);
        public selectedFundingStreams: KnockoutObservableArray<string> = ko.observableArray([]);

        public specifications: KnockoutObservableArray<SearchFacet> = ko.observableArray([]);
        public selectedSpecifications: KnockoutObservableArray<string> = ko.observableArray([]);

        public calculationStatus: KnockoutObservableArray<SearchFacet> = ko.observableArray([]);
        public selectedCalculationStatus: KnockoutObservableArray<string> = ko.observableArray([]);

        public selectedSearchFacets: KnockoutComputed<Array<SearchFacet>>;

        public selectedSearchFacetsString: KnockoutComputed<string>;

        public canSelectFilters: KnockoutComputed<boolean>;

        constructor() {
            let self = this;

            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            this.selectedSearchFacets = ko.computed(() => {
                let facets: Array<SearchFacet> = [];

                self.buildSelectedSearchFacets(facets, self.selectedAllocationLines(), self.allocationLines());
                self.buildSelectedSearchFacets(facets, self.selectedPeriods(), self.periods());
                self.buildSelectedSearchFacets(facets, self.selectedFundingStreams(), self.fundingStreams());
                self.buildSelectedSearchFacets(facets, self.selectedSpecifications(), self.specifications());
                self.buildSelectedSearchFacets(facets, self.selectedCalculationStatus(), self.calculationStatus());

                return facets;
            });

            this.selectedSearchFacetsString = ko.pureComputed(() => {
                let result : Array<Object> = [];

                ko.utils.arrayForEach(self.selectedSearchFacets(), (facet: SearchFacet, i: number) => {
                    let item = {
                        n: facet.name(),
                        f: facet.fieldName(),
                    }

                    result.push(item);
                });

                return JSON.stringify(result);
            });

            self.selectedSearchFacetsString.subscribe((newValue) => {
                self.performSearch();
                console.log("Selected search facets string:", newValue);
            });

            this.selectedAllocationLines.subscribe((newValue) => {
                console.log("Selected allocation lines changed to:", newValue);
            });

            this.canSelectFilters = ko.pureComputed(() => {
                return self.state() === "idle";
            });
        }


        public performSearch(pageNumber: number = null) {
            if (this.state() === "idle") {
                this.state("searching");

                let queryPageNumber = 1;
                if ($.isNumeric(pageNumber) && pageNumber > 0) {
                    queryPageNumber = pageNumber;
                }

                let filters: ISearchFilterRequest = {};
                ko.utils.arrayForEach(this.selectedSearchFacets(), (facet: SearchFacet, i: number) => {
                    if (facet) {
                        if (!filters[facet.fieldName()]) {
                            filters[facet.fieldName()] = [];
                        }

                        filters[facet.fieldName()].push(facet.name());
                    }
                });

                let data: ICalculationSearchRequest = {
                    pageNumber: queryPageNumber,
                    searchTerm: this.searchTerm(),
                    includeFacets: true,
                    filters: filters,
                };

                let request = $.ajax({
                    data: JSON.stringify(data),
                    url: "/api/calculations/search",
                    dataType: "json",
                    method: "POST",
                    contentType: "application/json"
                });

                let self = this;
                console.log("Starting search request");
                request.done((resultUntyped) => {
                    self.state("idle");
                    console.log("Search request completed");

                    let result: ICalculationSearchResultResponse = resultUntyped;
                    self.calculations(result.calculations);
                    self.startItemNumber(result.startItemNumber);
                    self.endItemNumber(result.endItemNumber);
                    self.totalResults(result.totalResults);
                    self.pagerState(result.pagerState);

                    self.pageNumber(result.pagerState.currentPage);

                    self.populateFacets("allocationLineName", result.facets, self.allocationLines);
                    self.populateFacets("periodName", result.facets, self.periods);
                    self.populateFacets("specificationName", result.facets, self.specifications);
                    self.populateFacets("fundingStreamName", result.facets, self.fundingStreams);
                    self.populateFacets("status", result.facets, self.calculationStatus);

                    this.searchPerformed(true);
                });
            }
        }

        public loadPage(pageNumber: number) {
            if ($.isNumeric(pageNumber)) {
                this.performSearch(pageNumber);
            }
        }

        public removeFilter(searchFacet: SearchFacet) {
            if (searchFacet && this.canSelectFilters()) {
                let selectedArray : KnockoutObservableArray<string> = null;
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

        private populateFacets(filterName: string, facetResults: Array<ISearchFacetResponse>, facetObservableArray: KnockoutObservableArray<SearchFacet>) {
            let searchFacetResponse: ISearchFacetResponse = ko.utils.arrayFirst(facetResults, (item: ISearchFacetResponse) => {
                return item.name === filterName;
            });

            let facets: Array<SearchFacet> = [];

            if (searchFacetResponse) {
                if (searchFacetResponse.facetValues) {
                    for (let i in searchFacetResponse.facetValues) {
                        let responseValue: ISearchFacetValueResponse = searchFacetResponse.facetValues[i];
                        let facet = new SearchFacet(responseValue.name, responseValue.count, searchFacetResponse.name);
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

        private buildSelectedSearchFacets(existingFacets: Array<SearchFacet>, selectedSearchFacets: Array<string>, searchFacetOptions: Array<SearchFacet>) {
            ko.utils.arrayForEach(selectedSearchFacets, (facetName: string, index: number) => {
                if (typeof facetName !== "undefined") {
                    if (facetName) {
                        let facet = ko.utils.arrayFirst(searchFacetOptions, (f: SearchFacet) => {
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

    export interface ICalculationSearchResultResponse {
        calculations: Array<ICalculationResponse>;
        currentPage: number;
        endItemNumber: 50;
        facets: Array<ISearchFacetResponse>;
        pagerState: IPagerStateResponse;
        startItemNumber: number;
        totalResults: number;
    }

    export interface ICalculationResponse {
        id: string;
        name: string;
        periodName: string;
        specificationName: string;
        status: string;
    }

    export interface ISearchFacetResponse {
        facetValues: Array<ISearchFacetValueResponse>;
        name: string;
    }

    export interface ISearchFacetValueResponse {
        name: string;
        count: number;
    }

    export interface IPagerStateResponse {
        currentPage: number;
        displayNumberOfPages: number;
        nextPage: number;
        pages: Array<number>;
        previousPage: number;
    }

    export interface ICalculationSearchRequest {
        pageNumber: number;
        searchTerm: string;
        includeFacets: boolean;
        filters: ISearchFilterRequest
    }

    export interface ISearchFilterRequest {
        [fieldName: string]: Array<string>
    }

    export class SearchFacet {
        public name: KnockoutObservable<string> = ko.observable();
        public count: KnockoutObservable<number> = ko.observable();
        public fieldName: KnockoutObservable<string> = ko.observable();
        public displayName: KnockoutComputed<string>;

        constructor(name: string, count: number, fieldName: string) {
            if (!name) {
                throw new Error("Name not specificed");
            }
            this.name(name);

            this.count(count);
            if (!fieldName) {
                throw new Error("Field name not specified");
            }
            this.fieldName(fieldName);

            let self = this;

            this.displayName = ko.pureComputed(() => {
                if (!self.name()) {
                    return "";
                }

                if (self.count()) {
                    return self.name() + " (" + self.count() + ")";
                }
                else {
                    return self.name();
                }
            });
        }
    }
}