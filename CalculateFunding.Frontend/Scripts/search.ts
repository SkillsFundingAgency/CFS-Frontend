namespace calculateFunding.search {
    export const IdleStateKey: string = "idle";
    export const SearchingStateKey: string = "loading";

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

    export class SearchFilter {

        public name: string;

        public term: string;
    }

    export abstract class SearchViewModel {

        public state: KnockoutObservable<string> = ko.observable(IdleStateKey);

        public pageNumber: KnockoutObservable<number> = ko.observable(1);

        public searchPerformed: KnockoutObservable<boolean> = ko.observable(false);

        public searchTerm: KnockoutObservable<string> = ko.observable("");

        public isLoading: KnockoutComputed<boolean>;
        public isResultsVisible: KnockoutComputed<boolean>;

        public startItemNumber: KnockoutObservable<number> = ko.observable();
        public endItemNumber: KnockoutObservable<number> = ko.observable();
        public totalResults: KnockoutObservable<number> = ko.observable();

        public canPerformSearch: KnockoutComputed<boolean>;

        public pagerState: KnockoutObservable<calculateFunding.common.IPagerStateResponse> = ko.observable(null);

        public selectedSearchFacets: KnockoutComputed<Array<calculateFunding.search.SearchFacet>>;

        public selectedSearchFacetsString: KnockoutComputed<string>;

        public canSelectFilters: KnockoutComputed<boolean>;

        public errorMessage: KnockoutObservable<string> = ko.observable();

        public selectedSearchFilters: KnockoutComputed<Array<calculateFunding.search.SearchFilter>>;

        public isPageLoaded: KnockoutComputed<boolean>;

        constructor() {
            var self = this;

            this.isPageLoaded = ko.pureComputed(() => {
                return true;
            });

            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === IdleStateKey;
            });

            this.canSelectFilters = ko.pureComputed(() => {
                return self.state() === IdleStateKey;
            });

            this.isLoading = ko.pureComputed(() => {
                return self.state() === SearchingStateKey;
            });

            this.isResultsVisible = ko.pureComputed(() => {
                return self.state() === IdleStateKey && self.searchPerformed();
            });
        }

        public abstract performSearch(pageNumber?: number): void;

        public abstract removeFilter(searchFacet: SearchFacet): void;

        public loadPage(pageNumber: number): void {
            if ($.isNumeric(pageNumber)) {
                this.performSearch(pageNumber);
            }
        }

        protected makeSearchResultAndProcess(searchUrl: string, pageNumber: number = null, searchResultCallback: (searchRequestResponse: any) => void, optionalQueryData: Object = null): void {
            if (this.state() === IdleStateKey) {
                if (!searchUrl) {
                    throw new Error("Empty or null searchUrl");
                }

                this.state(SearchingStateKey);
                this.errorMessage(null);

                let queryPageNumber = 1;
                if ($.isNumeric(pageNumber) && pageNumber > 0) {
                    queryPageNumber = pageNumber;
                }

                var filters: calculateFunding.common.ISearchFilterRequest = {};

                if (this.selectedSearchFacets) {
                    ko.utils.arrayForEach(this.selectedSearchFacets(), (facet: calculateFunding.search.SearchFacet, i: number) => {
                        if (facet) {
                            if (!filters[facet.fieldName()]) {
                                filters[facet.fieldName()] = [];
                            }

                            filters[facet.fieldName()].push(facet.name());
                        }
                    });
                }

                if (this.selectedSearchFilters) {
                    ko.utils.arrayForEach(this.selectedSearchFilters(), (searchFilter: calculateFunding.search.SearchFilter, i: number) => {
                        if (searchFilter) {
                            if (!filters[searchFilter.name]) {
                                filters[searchFilter.name] = [];
                            }

                            filters[searchFilter.name].push(searchFilter.term);
                        }
                    });
                }

                //cant bind to the search term box for some reason, needs looking at

                let searchRequestData: calculateFunding.common.ISearchRequest = {
                    pageNumber: queryPageNumber,
                    searchTerm: this.searchTerm(),
                    includeFacets: true,
                    filters: filters,
                };

                let data = searchRequestData;

                if (optionalQueryData) {
                    optionalQueryData = Object.assign(data, optionalQueryData);
                }

                let request = $.ajax({
                    data: JSON.stringify(data),
                    url: searchUrl,
                    dataType: "json",
                    method: "POST",
                    contentType: "application/json"
                });

                let self = this;
                console.log("Starting search request");
                request.done((resultUntyped) => {
                    console.log("Search request completed");

                    if (searchResultCallback) {
                        searchResultCallback(resultUntyped);
                    }

                    this.searchPerformed(true);
                    self.state(IdleStateKey);
                });

                request.fail((xhrDetails: JQuery.jqXHR<any>, errorStatus: JQuery.Ajax.ErrorTextStatus) => {
                    self.errorMessage("Request to search failed. " + xhrDetails.statusText + ". Error code=" + xhrDetails.status);
                    self.state(IdleStateKey);
                });
            }
        }

        protected populateSearchResults(results: any, searchResultCallback: (searchRequestResponse: any) => void) {
            this.state(SearchingStateKey);
            this.errorMessage(null);

            if (searchResultCallback) {
                searchResultCallback(results);
            }

            this.searchPerformed(true);
            this.state(IdleStateKey);
        }

        protected populateCommonSearchResultProperties(searchResponse: calculateFunding.common.ISearchResultResponse) {
            this.startItemNumber(searchResponse.startItemNumber);
            this.endItemNumber(searchResponse.endItemNumber);
            this.totalResults(searchResponse.totalResults);
            this.pagerState(searchResponse.pagerState);
            this.pageNumber(searchResponse.pagerState.currentPage);
        }

        protected populateFacets(filterName: string, facetResults: Array<calculateFunding.common.ISearchFacetResponse>, facetObservableArray: KnockoutObservableArray<calculateFunding.search.SearchFacet>) {
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

        protected buildSelectedSearchFacets(existingFacets: Array<calculateFunding.search.SearchFacet>, selectedSearchFacets: Array<string>, searchFacetOptions: Array<calculateFunding.search.SearchFacet>) {
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
}

if (typeof Object.prototype.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target: any, varArgs: any) { // .length of function is 2
            'use strict';
            if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }

            var to = Object(target);

            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}