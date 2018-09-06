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

        results: KnockoutObservableArray<PublishedProviderResultViewModel> = ko.observableArray([]);

        canApprove: KnockoutComputed<boolean> = ko.computed(function () {
            for (let i = 0; i < this.results().length; i++) {
                let providerResult = this.results()[i];

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
            for (let i = 0; i < this.results().length; i++) {
                let providerResult = this.results()[i];

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

            let pOne = new PublishedProviderResultViewModel();
            pOne.authority = "Authority one";
            pOne.fundingAmount = 1900000.23;
            pOne.numberApproved = 1;
            pOne.numberNew = 1;
            pOne.numberPublished = 1;
            pOne.numberUpdated = 1;
            pOne.providerId = "ProvId1";
            pOne.providerName = "Provider One";
            pOne.totalAllocationLines = 4;
            pOne.ukprn = "UKPRN1";

            let aOne = new PublishedAllocationLineResultViewModel();
            aOne.allocationLineId = "Alloc1";
            aOne.allocationLineName = "Allocation Line 1";
            aOne.fundingAmount = 123000;
            aOne.status = AllocationLineStatus.New;
            aOne.version = "0.1";

            let aTwo = new PublishedAllocationLineResultViewModel();
            aTwo.allocationLineId = "Alloc2";
            aTwo.allocationLineName = "Allocation Line 2";
            aTwo.fundingAmount = 96000;
            aTwo.status = AllocationLineStatus.Approved;
            aTwo.version = "0.2";

            let aThree = new PublishedAllocationLineResultViewModel();
            aThree.allocationLineId = "Alloc3";
            aThree.allocationLineName = "Allocation Line 3";
            aThree.fundingAmount = 50000.23;
            aThree.status = AllocationLineStatus.Updated;
            aThree.version = "1.3";

            let aFour = new PublishedAllocationLineResultViewModel();
            aFour.allocationLineId = "Alloc4";
            aFour.allocationLineName = "Allocation Line 4";
            aFour.fundingAmount = 1631000;
            aFour.status = AllocationLineStatus.Published;
            aFour.version = "2.0";

            pOne.allocationLineResults.push(aOne);
            pOne.allocationLineResults.push(aTwo);
            pOne.allocationLineResults.push(aThree);
            pOne.allocationLineResults.push(aFour);
            this.results.push(pOne);
        }

        selectAll: KnockoutComputed<boolean> = ko.computed({
            read: function () {
                for (let i = 0; i < this.results().length; i++) {
                    let providerResult = this.results()[i];
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
                ko.utils.arrayForEach(this.results(), function (providerResult: PublishedProviderResultViewModel) {
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