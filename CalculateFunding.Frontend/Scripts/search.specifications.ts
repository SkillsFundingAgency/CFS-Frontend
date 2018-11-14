namespace calculateFunding.manageSpecifications {

    export class SpecificationSearchViewModel extends calculateFunding.search.SearchViewModel {
        public specifications: KnockoutObservableArray<ISpecificationResponse> = ko.observableArray([]);

        public statuses: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedStatuses: KnockoutObservableArray<string> = ko.observableArray([]);

        public fundingPeriods: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedFundingPeriods: KnockoutObservableArray<string> = ko.observableArray([]);

        public fundingStreams: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectedFundingStreams: KnockoutObservableArray<string> = ko.observableArray([]);

        public multiSelectConfigOptions = {
            templates: {
                button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"><span class="multiselect-selected-text">Show all</span> <b class="caret"></b></button>',
                ul: '<ul class="multiselect-container dropdown-menu" role="listbox"></ul>',
                li: '<li><a href="javascript:void(0);" role="option"><label></label></a></li>'
            },
            nonSelectedText: 'Show all',
            buttonWidth: '100%',
            disableIfEmpty: true
        };

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

                super.buildSelectedSearchFacets(facets, self.selectedStatuses(), self.statuses());
                super.buildSelectedSearchFacets(facets, self.selectedFundingPeriods(), self.fundingPeriods());
                super.buildSelectedSearchFacets(facets, self.selectedFundingStreams(), self.fundingStreams());

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
                    let result: ISpecificationSearchResultResponse = resultUntyped;
                    self.specifications(result.specifications);

                    self.populateCommonSearchResultProperties(result);

                    self.populateFacets("status", result.facets, self.statuses);
                    self.populateFacets("fundingPeriodName", result.facets, self.fundingPeriods);
                    self.populateFacets("fundingStreamNames", result.facets, self.fundingStreams);
                }
            }
        }

        public performSearch(pageNumber: number = null) {
            let self = this;

            super.makeSearchResultAndProcess("/api/specifications/search", pageNumber, self.searchCompleted);
        }

        /**
        * Sets the initial result (from PageModel via cshtml of JSON Ajax payload)
        * @param response
        */
        public setInitialResults(response: ISpecificationSearchResultResponse): void {
            if (response) {
                this.populateSearchResults(response, this.searchCompleted);

                if (typeof response.specifications !== "undefined" && response.specifications) {
                    this.specifications(response.specifications);
                }
            }
        }

        public removeFilter(searchFacet: calculateFunding.search.SearchFacet) {
            if (searchFacet && this.canSelectFilters()) {
                let selectedArray: KnockoutObservableArray<string> = null;
                let fieldName = searchFacet.fieldName();
                if (fieldName === "status") {
                    selectedArray = this.selectedStatuses;
                } else if (fieldName === "fundingPeriodName") {
                    selectedArray = this.selectedFundingPeriods;
                } else if (fieldName === "fundingStreamNames") {
                    selectedArray = this.selectedFundingStreams;
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

        public removeFilters(vm: SpecificationSearchViewModel, e :JQuery.Event<HTMLElement, null>) {
            this.selectedFundingPeriods([]);
            this.selectedFundingStreams([]);
            this.selectedStatuses([]);

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

    export interface ISpecificationSearchResultResponse extends calculateFunding.common.ISearchResultResponse {
        specifications: Array<ISpecificationResponse>;
    }

    export interface ISpecificationResponse {
        id: string;
        name: string;
        fundingPeriodName: string;
        fundingPeriodId: string;
        fundingStreamNames: Array<string>;
        fundingStreamIds: Array<string>;
        status: string;
        lastUpdatedDate: Date;
        lastUpdatedDateDisplay: string;
    }
}