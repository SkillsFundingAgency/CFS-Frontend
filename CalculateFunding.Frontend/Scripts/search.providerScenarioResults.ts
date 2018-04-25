namespace calculateFunding.listProviderTestResults {

    export class ProviderTestSearchViewModel extends calculateFunding.search.SearchViewModel {

        private providerId: string

        public selectedSpec: KnockoutObservable<string> = ko.observable();

        public selectedPeriod: KnockoutObservable<string> = ko.observable();

        public providerTestScenarios: KnockoutObservableArray<IProviderTestScenarioResponse> = ko.observableArray([]);

        constructor(options: IProviderTestSearchViewModelConstructorParameters) {
            super();
            if (typeof options === "undefined") {
                throw new Error("Constructor parameter options not passed");
            }

            this.extractProviderId(options);

            let self = this;

            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            this.selectedSearchFilters = ko.computed(() => {
                let filters: Array<calculateFunding.search.SearchFilter> = [];

                let specFilter: calculateFunding.search.SearchFilter =
                    {
                        name: ko.observable("specificationId"),
                        term: self.selectedSpec
                    };

                let specProviderId: calculateFunding.search.SearchFilter =
                    {
                        name: ko.observable("providerId"),
                        term: ko.observable(this.providerId)
                    };

                filters.push(specFilter);
                filters.push(specProviderId)
                console.log("returning filters");
                return filters;
            });

            this.selectedSpec.subscribe(() => {
                self.performSearch();
            });

            self.state.subscribe((newValue) => {
                console.log("State changed: ", newValue);
            });
        }

        private extractProviderId(options: IProviderTestSearchViewModelConstructorParameters) {
            this.providerId = options.providerId;
        }

        public specChanged(): void {
        }

        public periodChanged(): void {
            let selectedItem: string = $("#select-spec-period").val().toString();
            this.selectedPeriod(selectedItem);
            this.selectedSpec("");
        }

        public performSearch(pageNumber: number = null): void {
            let self = this;

            super.makeSearchResultAndProcess("/api/tests/testscenario-search", pageNumber, (resultUntyped) => {
                let result: ITestScenarioSearchResultResponse = resultUntyped;
                self.providerTestScenarios(result.testScenarios);
                self.populateCommonSearchResultProperties(result);
            });
        }

        public removeFilter(SearchFacet: calculateFunding.search.SearchFacet): void {
            throw new Error("Method not implemented");
        }
    }

    export interface ITestScenarioSearchResultResponse extends calculateFunding.common.ISearchResultResponse {
        testScenarios: Array<IProviderTestScenarioResponse>
    }

    export interface IProviderTestScenarioResponse {
        id: string;
        testresult: string;
        specificationid: string;
        specificationname: string;
        testScenarioid: string;
        testScenarioname: string;
        providerid: string;
        providername: string;
        lastupdated: string;
    }

    export interface IProviderTestSearchViewModelConstructorParameters {
        providerId: string;
    }
}
