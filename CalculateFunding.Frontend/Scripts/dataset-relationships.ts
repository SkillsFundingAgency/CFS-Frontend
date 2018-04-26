namespace calculateFunding.manageDatasetRelationships {

    export class DatasetRelationshipsSearchViewModel extends calculateFunding.search.SearchViewModel {

        public specRelationships: KnockoutObservableArray<IDatasetRelationshipResponse> = ko.observableArray([]);

        public selectedPeriod: KnockoutObservable<string> = ko.observable();

        constructor() {
            super();

            let self = this;

            this.canPerformSearch = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            this.selectedSearchFilters = ko.computed(() => {
                let filters: Array<calculateFunding.search.SearchFilter> = [];

                let filter: calculateFunding.search.SearchFilter =
                    {
                        name : "periodId",
                        term: self.selectedPeriod()
                    };

                filters.push(filter);

                return filters;
            });
        }

        public periodChanged(): void {
            let selectedItem: string = $("#select-spec-period").val().toString();
            this.selectedPeriod(selectedItem);
            this.performSearch();
        }

        public performSearch(pageNumber: number = null): void {

            let self = this;

            super.makeSearchResultAndProcess("/api/datasetrelationships/search", pageNumber, (resultUntyped) => {
                let result: IDatasetRelationshipSearchResultResponse = resultUntyped;
                self.specRelationships(result.specRelationships);
                self.populateCommonSearchResultProperties(result);

            });
        }

        public removeFilter(searchFacet: calculateFunding.search.SearchFacet): void {
            throw new Error("Method not implemented.");
        }
    }

    export interface IDatasetRelationshipSearchResultResponse extends calculateFunding.common.ISearchResultResponse {
        specRelationships: Array<IDatasetRelationshipResponse>
    }

    export interface IDatasetRelationshipResponse {
        specificationId: string;
        specificationName: string;
        countPhrase: string;
    }
}