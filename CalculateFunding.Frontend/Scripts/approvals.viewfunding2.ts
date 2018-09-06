namespace calculateFunding.approvals {
    export class ViewFundingViewModel {
        private settings: IViewFundingSettings;

        constructor(settings: IViewFundingSettings) {
            if (typeof settings !== "undefined" && settings === null) {
                throw "Settings must be provided to the view funding view model";
            }
            else if (typeof settings.antiforgeryToken !== "undefined" && settings.antiforgeryToken === null) {
                throw "Settings must contain the antiforgeryToken";
            }
            else if (typeof settings.testScenarioQueryUrl !== "undefined" && settings.testScenarioQueryUrl === null) {
                throw "Settings must contain the test scenario query url";
            }

            this.settings = settings;
        }

        specificationId: string;
        specificationName: string;
        fundingPeriod: string;
        fundingStream: string;

        pageNumber: KnockoutObservable<number> = ko.observable(0);
        allPageNumbers: KnockoutObservableArray<number> = ko.observableArray([]);
        itemsPerPage: number = 4;

        allProviderResults: KnockoutObservableArray<PublishedProviderResultViewModel> = ko.observableArray([]);
        filteredResults: KnockoutComputed<Array<PublishedProviderResultViewModel>> = ko.computed(function () {
            return this.allProviderResults();
        }, this);
        currentPageResults: KnockoutComputed<Array<PublishedProviderResultViewModel>> = ko.computed(function () {
            let startIndex = this.pageNumber() * this.itemsPerPage;
            return this.filteredResults().slice(startIndex, startIndex + this.itemsPerPage);
        }, this);

        totalPages: KnockoutComputed<number> = ko.computed(function () {
            let totalPages = Math.ceil(this.filteredResults().length / this.itemsPerPage);

            this.allPageNumbers.removeAll();
            for (let i = 0; i < totalPages; i++) {
                this.allPageNumbers.push(i + 1);
            }

            return totalPages;
        }, this);

        hasPrevious: KnockoutComputed<boolean> = ko.computed(function () {
            return this.pageNumber() !== 0;
        }, this);

        hasNext: KnockoutComputed<boolean> = ko.computed(function () {
            return this.pageNumber() + 1 !== this.totalPages();
        }, this);

        viewPrevious() {
            if (this.pageNumber() !== 0) {
                this.pageNumber(this.pageNumber() - 1);
            }
        }

        viewNext() {
            if (this.pageNumber() < this.totalPages()) {
                this.pageNumber(this.pageNumber() + 1);
            }
        }

        viewPage(parentVM: ViewFundingViewModel, targetPage: number) {
            return parentVM.pageNumber(targetPage - 1);
        }

        canApprove: KnockoutComputed<boolean> = ko.computed(function () {
            for (let i = 0; i < this.allProviderResults().length; i++) {
                let providerResult = this.allProviderResults()[i];

                for (let j = 0; j < providerResult.allocationLineResults().length; j++) {
                    let allocationLineResult = providerResult.allocationLineResults()[j];

                    if (allocationLineResult.isSelected() && allocationLineResult.status === AllocationLineStatus.New) {
                        return true;
                    }
                }

                return false;
            }
        }, this);
        approve() { alert('the approve button is not implemented yet'); }

        canPublish: KnockoutComputed<boolean> = ko.computed(function () {
            for (let i = 0; i < this.allProviderResults().length; i++) {
                let providerResult = this.allProviderResults()[i];

                for (let j = 0; j < providerResult.allocationLineResults().length; j++) {
                    let allocationLineResult = providerResult.allocationLineResults()[j];

                    if (allocationLineResult.isSelected() && (allocationLineResult.status === AllocationLineStatus.Approved || allocationLineResult.status === AllocationLineStatus.Updated)) {
                        return true;
                    }
                }

                return false;
            }
        }, this);
        publish() { alert('the publish button is not implemented yet'); }

        loadResults() {
            this.specificationId = "abc1";
            this.specificationName = "Selected Specification ABC";
            this.fundingPeriod = "Test Funding Period";
            this.fundingStream = "Test Funding Stream";

            for (let i = 0; i < 10; i++) {
                let provResult = new PublishedProviderResultViewModel();
                provResult.authority = "Authority " + i;
                provResult.fundingAmount = (Math.random() * 1000) + 1;
                provResult.numberApproved = 1;
                provResult.numberNew = 1;
                provResult.numberPublished = 1;
                provResult.numberUpdated = 1;
                provResult.providerId = "ProvId" + i;
                provResult.providerName = "Provider " + i;
                provResult.totalAllocationLines = 4;
                provResult.ukprn = "UKPRN" + i;

                let aOne = new PublishedAllocationLineResultViewModel();
                aOne.allocationLineId = provResult.providerId + "-Alloc1";
                aOne.allocationLineName = "Allocation Line 1";
                aOne.fundingAmount = (Math.random() *100) + 1;
                aOne.status = AllocationLineStatus.New;
                aOne.version = "0.1";

                let aTwo = new PublishedAllocationLineResultViewModel();
                aTwo.allocationLineId = provResult.providerId + "-Alloc2";
                aTwo.allocationLineName = "Allocation Line 2";
                aTwo.fundingAmount = (Math.random() * 100) + 1;
                aTwo.status = AllocationLineStatus.Approved;
                aTwo.version = "0.2";

                let aThree = new PublishedAllocationLineResultViewModel();
                aThree.allocationLineId = provResult.providerId + "-Alloc3";
                aThree.allocationLineName = "Allocation Line 3";
                aThree.fundingAmount = (Math.random() * 100) + 1;
                aThree.status = AllocationLineStatus.Updated;
                aThree.version = "1.3";

                let aFour = new PublishedAllocationLineResultViewModel();
                aFour.allocationLineId = provResult.providerId + "-Alloc4";
                aFour.allocationLineName = "Allocation Line 4";
                aFour.fundingAmount = (Math.random() * 100) + 1;
                aFour.status = AllocationLineStatus.Published;
                aFour.version = "2.0";

                provResult.allocationLineResults.push(aOne);
                provResult.allocationLineResults.push(aTwo);
                provResult.allocationLineResults.push(aThree);
                provResult.allocationLineResults.push(aFour);
                this.allProviderResults.push(provResult);
            }
        }

        selectAll: KnockoutComputed<boolean> = ko.computed({
            read: function () {
                for (let i = 0; i < this.filteredResults().length; i++) {
                    let providerResult = this.filteredResults()[i];
                    for (let j = 0; j < providerResult.allocationLineResults().length; j++) {
                        let allocationLineResult = providerResult.allocationLineResults()[j];
                        if (!allocationLineResult.isSelected()) {
                            return false;
                        }
                    }
                }

                return true;
            },
            write: function (newValue) {
                ko.utils.arrayForEach(this.filteredResults(), function (providerResult: PublishedProviderResultViewModel) {
                    ko.utils.arrayForEach(providerResult.allocationLineResults(), function (allocationLineResult: PublishedAllocationLineResultViewModel) {
                        allocationLineResult.isSelected(newValue);
                    })
                });
            }
        }, this);

        expandProvider(providerResult: PublishedProviderResultViewModel, parentVM: ViewFundingViewModel) {

            if (!providerResult.qaTestResults()) {

                providerResult.qaTestResultsRequestStatus('loading');

                let getQAResultsUrl = parentVM.settings.testScenarioQueryUrl.replace("{specificationId}", parentVM.specificationId);
                let query = $.ajax({
                    url: getQAResultsUrl + "/" + providerResult.providerId,
                    method: 'GET',
                    type: 'json'
                })
                    .done((result) => {
                        let resultTyped: IQAResultResponse = result;
                        providerResult.qaTestResults(resultTyped);

                        providerResult.qaTestResultsRequestStatus('loaded');

                    })
                    .fail(() => {
                        providerResult.qaTestResultsRequestStatus('failed');
                    });
            }
        }
    }

    class PublishedProviderResultViewModel {
        providerName: string;
        providerId: string;
        ukprn: string;
        authority: string;
        fundingAmount: number;

        get fundingAmountDisplay(): string {
            return (Number(this.fundingAmount)).toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
        }

        totalAllocationLines: number;
        numberNew: number;
        numberApproved: number;
        numberUpdated: number;
        numberPublished: number;
        testCoveragePercent: number;
        testsPassed: number;
        testsTotal: number;

        allocationLineResults: KnockoutObservableArray<PublishedAllocationLineResultViewModel> = ko.observableArray([]);

        qaTestResults: KnockoutObservable<IQAResultResponse> = ko.observable(null);
        qaTestResultsRequestStatus: KnockoutObservable<string> = ko.observable(null);

        isSelected: KnockoutComputed<boolean> = ko.computed({
            read: function () {
                for (let i = 0; i < this.allocationLineResults().length; i++) {
                    let allocationLineResult = this.allocationLineResults()[i];
                    if (!allocationLineResult.isSelected()) {
                        return false;
                    }
                }

                return true;
            },
            write: function (newValue) {
                for (let i = 0; i < this.allocationLineResults().length; i++) {
                    let allocationLineResult = this.allocationLineResults()[i];
                    allocationLineResult.isSelected(newValue);
                }
            }
        }, this);
    }

    class PublishedAllocationLineResultViewModel {
        allocationLineId: string;
        allocationLineName: string;
        status: AllocationLineStatus;
        fundingAmount: number;

        get fundingAmountDisplay(): string {
            return (Number(this.fundingAmount)).toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
        }

        version: string;

        isSelected: KnockoutObservable<boolean> = ko.observable(false);
    }

    export enum AllocationLineStatus {
        New,
        Approved,
        Updated,
        Published
    }

    interface IViewFundingSettings {
        testScenarioQueryUrl: string;
        viewFundingPageUrl: string;
        antiforgeryToken: string;
    }

    interface IQAResultResponse {
        passed: number;
        failed: number;
        ignored: number;
        testCoverage: number;
    }
}