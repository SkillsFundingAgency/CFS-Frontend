namespace calculateFunding.listProviderTestResults {

    export class ProviderTestSearchViewModel extends calculateFunding.search.SearchViewModel {

        private providerId: string

        public selectedSpec: KnockoutObservable<string> = ko.observable();

        public selectedFundingPeriod: KnockoutObservable<string> = ko.observable();

        public providerTestScenarios: KnockoutObservableArray<IProviderTestScenarioResponse> = ko.observableArray([]);

        public passed: KnockoutObservable<number> = ko.observable(0);

        public failed: KnockoutObservable<number> = ko.observable(0);

        public ignored: KnockoutObservable<number> = ko.observable(0);

        public testCoverage: KnockoutObservable<string> = ko.observable("0");

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
                        name: "specificationId",
                        term: self.selectedSpec()
                    };

                let specProviderId: calculateFunding.search.SearchFilter =
                    {
                        name: "providerId",
                        term: this.providerId
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

        public fundingPeriodChanged(): void {
            let selectedItem: string = $("#select-spec-period").val().toString();
            this.selectedFundingPeriod(selectedItem);
            this.selectedSpec("");
        }

        public performSearch(pageNumber: number = null): void {
            let self = this;

            super.makeSearchResultAndProcess("/api/tests/testscenario-search", pageNumber, (resultUntyped) => {
                let result: ITestScenarioSearchResultResponse = resultUntyped;
                self.providerTestScenarios(result.testScenarios);
                self.populateCommonSearchResultProperties(result);

                let passed: IProviderTestScenarioResponse[] = ko.utils.arrayFilter(result.testScenarios, (item: IProviderTestScenarioResponse) => {
                    return item.testResult === "Passed";
                });

                let failed: IProviderTestScenarioResponse[] = ko.utils.arrayFilter(result.testScenarios, (item: IProviderTestScenarioResponse) => {
                    return item.testResult === "Failed";
                });

                let ignored: IProviderTestScenarioResponse[] = ko.utils.arrayFilter(result.testScenarios, (item: IProviderTestScenarioResponse) => {
                    return item.testResult === "Ignored";
                });

                let total: number = passed.length + failed.length + ignored.length;

                let testCoverage: string = "0";

                if (total > 0) {
                    testCoverage = ((passed.length + failed.length) / total * 100).toFixed(1);
                }

                self.passed(passed.length);
                self.failed(failed.length);
                self.ignored(ignored.length);
                self.testCoverage(testCoverage);
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
        testResult: string;
        specificationId: string;
        specificationName: string;
        testScenarioId: string;
        testScenarioName: string;
        providerId: string;
        providerName: string;
        lastUpdated: string;
    }

    export interface IProviderTestSearchViewModelConstructorParameters {
        providerId: string;
    }
}
