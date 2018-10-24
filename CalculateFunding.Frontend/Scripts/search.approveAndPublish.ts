namespace calculateFunding.approvals {
    export class ApproveAndPublishSearchViewModel {
        public allSearchFacets: KnockoutComputed<Array<string>>;

        public selectableLocalAuthorities: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectableStatuses: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectableAllocationLines: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);
        public selectableProviderTypes: KnockoutObservableArray<calculateFunding.search.SearchFacet> = ko.observableArray([]);

        public selectedLocalAuthorities: KnockoutObservableArray<string> = ko.observableArray([]);
        public selectedStatuses: KnockoutObservableArray<string> = ko.observableArray([]);
        public selectedAllocationLines: KnockoutObservableArray<string> = ko.observableArray([]);
        public selectedProviderTypes: KnockoutObservableArray<string> = ko.observableArray([]);

        constructor() {
            this.allSearchFacets = ko.computed(() => {
                let allFacets: Array<string> = [];
                if (this.selectedLocalAuthorities) {
                    let selectedAuthorities = this.selectedLocalAuthorities();
                    if (selectedAuthorities && selectedAuthorities.length != 0) {
                        allFacets = allFacets.concat(selectedAuthorities);
                    }
                }
                if (this.selectedStatuses) {
                    let selectedStatuses = this.selectedStatuses();
                    if (selectedStatuses && selectedStatuses.length != 0) {
                        allFacets = allFacets.concat(selectedStatuses);
                    }
                }
                if (this.selectedAllocationLines) {
                    let allocationLines = this.selectedAllocationLines();
                    if (allocationLines && allocationLines.length != 0) {
                        allFacets = allFacets.concat(allocationLines);
                    }
                }
                if (this.selectedProviderTypes) {
                    let providerTypes = this.selectedProviderTypes();
                    if (providerTypes && providerTypes.length != 0) {
                        allFacets = allFacets.concat(providerTypes);
                    }
                }
                return allFacets;
            }).extend({ throttle: 5 });
        };

        reflectSelectableFilters(publishedProviderResultViewModels: PublishedProviderResultViewModel[]) {
            if (publishedProviderResultViewModels && publishedProviderResultViewModels.length != 0) {
                let providerTypes: string[] = [];
                let allocationLines: string[] = [];
                let localAuthorities: string[] = [];
                let statuses: string[] = [];

                for (let i = 0; i < publishedProviderResultViewModels.length; i++) {
                    let publishedProviderResultModel = publishedProviderResultViewModels[i];
                    if (localAuthorities.indexOf(publishedProviderResultModel.authority) == -1) {
                        localAuthorities.push(publishedProviderResultModel.authority);
                    }
                    if (providerTypes.indexOf(publishedProviderResultModel.providerType) == -1) {
                        providerTypes.push(publishedProviderResultModel.providerType);
                    }

                    let allocationLinesResults = publishedProviderResultModel.allocationLineResults();

                    for (let j = 0; j < allocationLinesResults.length; j++) {
                        let allocationLine = allocationLinesResults[j];
                        if (statuses.indexOf(allocationLine.statusAsString) == -1) {
                            statuses.push(allocationLine.statusAsString);
                        }
                        if (allocationLines.indexOf(allocationLine.allocationLineName) == -1) {
                            allocationLines.push(allocationLine.allocationLineName);
                        }
                    }
                }

                let providerTypesSearchFacets = providerTypes.map(function (a) { return new calculateFunding.search.SearchFacet(a, 0, a) });
                let allocationLinesSearchFacets = allocationLines.map(function (a) { return new calculateFunding.search.SearchFacet(a, 0, a) });
                let localAuthoritySearchFacets = localAuthorities.map(function (a) { return new calculateFunding.search.SearchFacet(a, 0, a) });
                let statusesSearchFacets = statuses.map(function (s) { return new calculateFunding.search.SearchFacet(s, 0, s) });

                this.selectableStatuses(statusesSearchFacets);
                this.selectableLocalAuthorities(localAuthoritySearchFacets);
                this.selectableProviderTypes(providerTypesSearchFacets);
                this.selectableAllocationLines(allocationLinesSearchFacets);
            }
        }

        public filterResults(publishedProviderResults: PublishedProviderResultViewModel[]) {
            let filteredResultsRaw: Array<PublishedProviderResultViewModel> = publishedProviderResults;
            let self = this;
            if (self.allSearchFacets && self.allSearchFacets().length != 0) {
                filteredResultsRaw = filteredResultsRaw.filter(function (p: PublishedProviderResultViewModel) {
                    let selectedProviderTypes = self.selectedProviderTypes();
                    let selectedAllocationLines = self.selectedAllocationLines();
                    let selectedLocalAuthoritiesUnwrapped = self.selectedLocalAuthorities();
                    let selectedStatuses = self.selectedStatuses();

                    let filteredAllocationLines = p.allocationLineResults();

                    let isStatusSelected = selectedStatuses && selectedStatuses.length != 0;
                    let isAllocationLinesSelected = selectedAllocationLines && selectedAllocationLines.length != 0;

                    if (isStatusSelected || isAllocationLinesSelected) {
                        filteredAllocationLines =
                            ko.utils.arrayFilter(p.allocationLineResults(), function (a: PublishedAllocationLineResultViewModel) {
                                let isStatusFound = true;
                                let isAllocationFound = true;
                                if ((isStatusSelected)) {
                                    isStatusFound = (!!ko.utils.arrayFirst(selectedStatuses, function (ss: string) {
                                        return ss === a.statusAsString;
                                    }));
                                }
                                if (isAllocationLinesSelected) {
                                    isAllocationFound = (!!ko.utils.arrayFirst(selectedAllocationLines, function (sa) {
                                        return sa === a.allocationLineName;
                                    }));
                                }
                                return isStatusFound && isAllocationFound;
                            });
                    }

                    if (!filteredAllocationLines || filteredAllocationLines.length == 0) {
                        return false;
                    }

                    let isLocalAuthoritiesSelected = selectedLocalAuthoritiesUnwrapped && selectedLocalAuthoritiesUnwrapped.length != 0;
                    let isProviderTypesSelected = selectedProviderTypes && selectedProviderTypes.length != 0;

                    if (!isLocalAuthoritiesSelected && !isProviderTypesSelected) {
                        return true;
                    }

                    let authorityFilterMatched = true;
                    let providerTypeFilterMatched = true;

                    if (isLocalAuthoritiesSelected) {
                        authorityFilterMatched = (!!ko.utils.arrayFirst(selectedLocalAuthoritiesUnwrapped, function (a) {
                            return a === p.authority;
                        }))
                    }
                    if (isProviderTypesSelected) {
                        providerTypeFilterMatched = (!!ko.utils.arrayFirst(selectedProviderTypes, function (pt) {
                            return pt === p.providerType;
                        }));
                    }
                    return (authorityFilterMatched && providerTypeFilterMatched);
                });
            }

            return filteredResultsRaw;
        };

        public removeFilters(e: JQuery.Event<HTMLElement, null>) {
            this.selectedLocalAuthorities([]);
            this.selectedProviderTypes([]);
            this.selectedStatuses([]);
            this.selectedAllocationLines([]);
        }
    }
}
