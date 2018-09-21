namespace calculateFunding.approvals {
    /** Main view model that the page will be bound to */
    export class ViewFundingViewModel {
        private settings: IViewFundingSettings;

        public isViewFundingButtonEnabled: KnockoutComputed<boolean>;

        public isSpecificationDropdownEnabled: KnockoutComputed<boolean>;

        public isViewFundingStreamDropdownEnabled: KnockoutComputed<boolean>;

        public isLoadingVisible: KnockoutComputed<boolean>;

        public state: KnockoutObservable<string> = ko.observable("idle");

        /** Included to cater for Approve and Publish selector feature */
        public FundingPeriods: KnockoutObservableArray<FundingPeriodResponse> = ko.observableArray();

        public Specifications: KnockoutObservableArray<SpecificationResponse> = ko.observableArray();

        public FundingStreams: KnockoutObservableArray<FundingStreamResponse> = ko.observableArray();

        selectedFundingPeriod: KnockoutObservable<SpecificationResponse> = ko.observable();

        selectedSpecification: KnockoutObservable<FundingPeriodResponse> = ko.observable();

        selectedFundingStream: KnockoutObservable<FundingStreamResponse> = ko.observable();

        pageState: KnockoutObservable<string> = ko.observable("initial");

        workingMessage: KnockoutObservable<string> = ko.observable(null);

        isWorkingVisible: KnockoutObservable<boolean> = ko.observable(false);

        workingPercentComplete: KnockoutObservable<number> = ko.observable(null);

        notificationMessage: KnockoutObservable<string> = ko.observable(null);

        notificationStatus: KnockoutObservable<string> = ko.observable();

        specificationId: string;

        selectedSpecValue: KnockoutObservable<string> = ko.observable("");

        pageNumber: KnockoutObservable<number> = ko.observable(0);

        itemsPerPage: number = 500;

        limitVisiblePageNumbers: number = 5;

        allProviderResults: KnockoutObservableArray<PublishedProviderResultViewModel> = ko.observableArray([]);

        constructor(settings: IViewFundingSettings) {
            if (typeof settings !== "undefined" && settings === null) {

                throw "Settings must be provided to the view funding view model";
            }
            else if (typeof settings.antiforgeryToken !== "undefined" && !settings.antiforgeryToken) {

                throw "Settings must contain the antiforgeryToken";
            }
            else if (typeof settings.testScenarioQueryUrl !== "undefined" && !settings.testScenarioQueryUrl) {

                throw "Settings must contain the test scenario query url";
            }
            else if (typeof settings.refreshPublishedResultsUrl !== "undefined" && !settings.refreshPublishedResultsUrl) {

                throw "Settings must contain the execute refresh url";
            }
            else if (typeof settings.checkPublishResultsStatusUrl !== "undefined" && !settings.checkPublishResultsStatusUrl) {

                throw "Settings must contain the check refresh url";
            }
            else if (typeof settings.approveAllocationLinesUrl !== "undefined" && !settings.approveAllocationLinesUrl) {

                throw "Settings must contain the approve allocation lines url";
            }
            else if (typeof settings.viewFundingPageUrl !== undefined && settings.viewFundingPageUrl === null) {

                throw "Settings must contain the view funding page query url";
            }
            else if (typeof settings.fundingPeriodUrl !== "undefined" && settings.fundingPeriodUrl === null) {

                throw "Settings must contain the funding period query url";
            }
            else if (typeof settings.fundingStreamsUrl !== "undefined" && settings.fundingStreamsUrl === null) {

                throw "Settings must contain the fuding streams query url";
            }
            else if (typeof settings.specificationsUrl !== "undefined" && settings.specificationsUrl === null) {

                throw "Settings must contain the specifications query url";
            }

            let self = this;

            self.settings = settings;

            // Defer updates on the array of items being bound to the page, so updates don't constantly to the UI and slow things down
            self.currentPageResults.extend({ deferred: true });

            self.pageState() == "initial";

            /**ApproveandPublishSelection section */
            /** Request to get the funding periods */
            let fundingPeriodRequest = $.ajax({

                url: this.settings.fundingPeriodUrl,
                dataType: "json",
                method: "get",
                contentType: "application/json",

            }).done(function (response) {

                let newPeriodArray = Array<FundingPeriodResponse>();

                ko.utils.arrayForEach(response, function (item: any) {

                    var x = new FundingPeriodResponse(item.id, item.name);

                    newPeriodArray.push(x);
                });

                self.FundingPeriods(newPeriodArray);
            })

            this.selectedFundingPeriod.subscribe(function () {

                if (self.selectedFundingPeriod() !== undefined && self.selectedFundingPeriod().value !== "Select") {

                    /** Load Specifications in the specification dropdown */
                    let getSpecificationForSelectedPeriodUrl = self.settings.specificationsUrl.replace("{fundingPeriodId}", self.selectedFundingPeriod().id);

                    let specificationRequest = $.ajax({

                        url: getSpecificationForSelectedPeriodUrl,
                        dataType: "json",
                        method: "get",
                        contentType: "application/json",

                    }).done(function (response) {

                        let newSpecificationArray = Array<SpecificationResponse>();

                        ko.utils.arrayForEach(response, function (item: any) {

                            var y = new SpecificationResponse(item.id, item.name, item.fundingStreams);

                            newSpecificationArray.push(y);
                        });

                        self.Specifications(newSpecificationArray);
                    })
                }
            });


            self.selectedSpecification.subscribe(function () {

                if (self.selectedSpecification() !== undefined && self.selectedFundingPeriod().value !== "Select") {

                    let newFundingStreamArray = Array<FundingStreamResponse>();

                    let spec = ko.utils.arrayFirst(self.Specifications(),
                        function (item: SpecificationResponse) {
                            return (item.id === self.selectedSpecification().id);
                        });

                    self.FundingStreams(spec.fundingstreams);
                } else {

                    self.FundingStreams([]);
                }
            });

            self.isSpecificationDropdownEnabled = ko.computed(() => {

                let isEnabled = (self.selectedFundingPeriod() !== undefined && self.selectedFundingPeriod().value !== "Select");

                return isEnabled;
            });

            self.isViewFundingStreamDropdownEnabled = ko.computed(() => {

                let isEnabled = (self.selectedSpecification() !== undefined && self.isSpecificationDropdownEnabled() && self.selectedFundingPeriod().value !== "Select");

                return isEnabled;
            });


            self.isViewFundingButtonEnabled = ko.computed(() => {

                let isEnabled = (self.selectedFundingStream() !== undefined && self.selectedFundingStream().name !== "Select"  
                    && self.selectedFundingPeriod() !== undefined && self.selectedFundingPeriod().value !== "Select"
                    && self.selectedSpecification() !== undefined && self.selectedSpecification().value !== "Select");

                return isEnabled;
            });
        }

        filteredResults: KnockoutComputed<Array<PublishedProviderResultViewModel>> = ko.pureComputed(function () {

            return this.allProviderResults();
        }, this);

        currentPageResults: KnockoutComputed<Array<PublishedProviderResultViewModel>> = ko.pureComputed(function () {

            let startIndex = this.pageNumber() * this.itemsPerPage;
            return this.filteredResults().slice(startIndex, startIndex + this.itemsPerPage);
        }, this);

        /** An array of the page numbers that contain the results */
        allPageNumbers: KnockoutComputed<Array<number>> = ko.pureComputed(function () {

            let totalPages = Math.ceil(this.filteredResults().length / this.itemsPerPage);

            let pageNumbers: Array<number> = [];
            for (let i = 0; i < totalPages; i++) {
                pageNumbers.push(i + 1);
            }

            return pageNumbers;
        }, this);

        visiblePageNumbers: KnockoutComputed<Array<number>> = ko.pureComputed(function () {
            let firstPage: number = this.pageNumber() - 2;

            if (firstPage + this.limitVisiblePageNumbers > this.allPageNumbers().length) {
                firstPage = this.allPageNumbers().length - this.limitVisiblePageNumbers;
            }

            if (firstPage < 0) {
                firstPage = 0;
            }

            return this.allPageNumbers().slice(firstPage, firstPage + this.limitVisiblePageNumbers);
        }, this);

        /** Is there a page previous to the current one */
        hasPrevious: KnockoutComputed<boolean> = ko.pureComputed(function () {

            return this.pageNumber() !== 0;
        }, this);

        /** Is there a page after the current one */
        hasNext: KnockoutComputed<boolean> = ko.pureComputed(function () {

            return this.pageNumber() + 1 !== this.allPageNumbers().length;
        }, this);

        /** Move to the previous page */
        viewPrevious() {
            if (this.pageNumber() !== 0) {

                this.pageNumber(this.pageNumber() - 1);
            }
        }

        /** Move to the next page */
        viewNext() {
            if (this.pageNumber() < this.allPageNumbers.length) {

                this.pageNumber(this.pageNumber() + 1);
            }
        }

        /** Move to a specific page */
        viewPage(parentVM: ViewFundingViewModel, targetPage: number) {
            return parentVM.pageNumber(targetPage - 1);
        }

        approvalDetails: KnockoutObservable<ConfirmPublishApproveViewModel> = ko.observable(new ConfirmPublishApproveViewModel());

        publishDetails: KnockoutObservable<ConfirmPublishApproveViewModel> = ko.observable(new ConfirmPublishApproveViewModel());

        /** Call the endpoint to change the status of selected allocation lines */
        private callChangeStatusEndpoint(action: StatusAction) {
            let updateModel = new PublishedAllocationLineResultStatusUpdateViewModel();

            updateModel.Status = AllocationLineStatus.Approved;

            let selectedItems = this.approvalDetails();

            let successMessage = "The status has successfully been transitioned to the Approved state for the selected items.";

            let failureMessage = "There was an error setting the status of the items to Approved.";

            let changeStatusUrl = this.settings.approveAllocationLinesUrl.replace("{specificationId}", this.selectedSpecification().id);

            this.workingMessage("Approving items.");

            if (action === StatusAction.Publish) {

                this.workingMessage("Publishing items.");

                // Change the variables if the action is publish
                updateModel.Status = AllocationLineStatus.Published;

                selectedItems = this.publishDetails();

                successMessage = "The status has successfully been transitioned to the Published state for the selected items.";

                failureMessage = "There was an error setting the status of the items to Published.";
            }

            //this.pageState("working-" + this.pageState());
            this.isWorkingVisible(true);

            for (let i = 0; i < selectedItems.allocationLines.length; i++) {

                let selectedItem = selectedItems.allocationLines[i];

                updateModel.Providers.push(new PublishedAllocationLineResultStatusUpdateProviderViewModel(selectedItem.providerId, selectedItem.allocationLineId));
            }

            $.ajax({
                url: changeStatusUrl,
                method: "PUT",
                contentType: 'application/json',
                data: JSON.stringify(updateModel),
                headers: {
                    RequestVerificationToken: this.settings.antiforgeryToken
                }
            })
                .done((result) => {
                    this.isWorkingVisible(false);

                    this.notificationMessage(successMessage);

                    this.notificationStatus('success');

                    // Once set need to reload the page to get new data and reset selection    
                    this.state("idle");
                    this.viewFunding();                
                })
                .fail((ex) => {
                    this.notificationMessage(failureMessage);

                    this.notificationStatus('error');

                    this.dismissConfirmPage();
                })
        }

        /** Has the used selected at least one allocation line result that can be approved */
        canApprove: KnockoutComputed<boolean> = ko.computed(function () {

            let providerResults = this.allProviderResults();

            for (let i = 0; i < providerResults.length; i++) {

                let allocationResults = providerResults[i].allocationLineResults();

                for (let j = 0; j < allocationResults.length; j++) {

                    let allocationLineResult = allocationResults[j];

                    if (allocationLineResult.isSelected() && allocationLineResult.status === AllocationLineStatus.Held) {

                        return true;
                    }
                }
            }

            return false;
        }, this);

        /** Show confirmation page for approval of selected allocation lines */
        confirmApprove() {
            let approveVM = new ConfirmPublishApproveViewModel();

            let selectedProviders: Array<string> = [];

            let selectedAuthorities: Array<string> = [];

            for (let i = 0; i < this.allProviderResults().length; i++) {
                let providerResult = this.allProviderResults()[i];

                let providerHasSelectedAllocations: boolean;

                for (let j = 0; j < providerResult.allocationLineResults().length; j++) {

                    let allocationResult = providerResult.allocationLineResults()[j];

                    if (allocationResult.isSelected() && allocationResult.status === AllocationLineStatus.Held) {
                        approveVM.allocationLines.push(new AllocationLineSummaryViewModel(providerResult.providerId, allocationResult.allocationLineId, allocationResult.allocationLineName, allocationResult.fundingAmount));

                        approveVM.totalFundingApproved += allocationResult.fundingAmount;

                        providerHasSelectedAllocations = true;
                    }
                }

                if (providerHasSelectedAllocations) {

                    selectedProviders.push(providerResult.providerName);

                    if (selectedAuthorities.indexOf(providerResult.authority) === -1) {

                        selectedAuthorities.push(providerResult.authority);
                    }
                }
            }

            approveVM.numberOfProviders = selectedProviders.length;

            approveVM.localAuthorities = new calculateFunding.controls.ExpanderViewModel(selectedAuthorities);

            approveVM.providerTypes = new calculateFunding.controls.ExpanderViewModel(selectedProviders);

            this.approvalDetails(approveVM);

            this.pageState("confirmApproval");

            this.notificationMessage(null);
        }

        /** Approve the selected allocation lines */
        approve() {
            this.callChangeStatusEndpoint(StatusAction.Approve);
        }

        /** Go back to the main view and clear any state from the confirmation pages */
        dismissConfirmPage() {

            this.approvalDetails(new ConfirmPublishApproveViewModel());

            this.publishDetails(new ConfirmPublishApproveViewModel());

            this.pageState("main");

            this.isWorkingVisible(false);
        }

        /** Has the used selected at least one allocation line result that can be published */
        canPublish: KnockoutComputed<boolean> = ko.pureComputed(function () {

            let providerResults = this.allProviderResults();

            for (let i = 0; i < providerResults.length; i++) {

                let allocationResults = providerResults[i].allocationLineResults();

                for (let j = 0; j < allocationResults.length; j++) {

                    let allocationLineResult = allocationResults[j];

                    if (allocationLineResult.isSelected() && (allocationLineResult.status === AllocationLineStatus.Approved || allocationLineResult.status === AllocationLineStatus.Updated)) {
                        return true;
                    }
                }
            }

            return false;
        }, this);

        /** Show confirmation page for publish of selected allocation lines */
        confirmPublish() {
            let publishVM = new ConfirmPublishApproveViewModel();

            let selectedProviders: Array<string> = [];

            let selectedAuthorities: Array<string> = [];

            for (let i = 0; i < this.allProviderResults().length; i++) {

                let providerResult = this.allProviderResults()[i];

                let providerHasSelectedAllocations: boolean;

                for (let j = 0; j < providerResult.allocationLineResults().length; j++) {

                    let allocationResult = providerResult.allocationLineResults()[j];

                    if (allocationResult.isSelected() && (allocationResult.status === AllocationLineStatus.Approved || allocationResult.status === AllocationLineStatus.Updated)) {

                        publishVM.allocationLines.push(new AllocationLineSummaryViewModel(providerResult.providerId, allocationResult.allocationLineId, allocationResult.allocationLineName, allocationResult.fundingAmount));

                        publishVM.totalFundingApproved += allocationResult.fundingAmount;

                        providerHasSelectedAllocations = true;
                    }
                }

                if (providerHasSelectedAllocations) {

                    selectedProviders.push(providerResult.providerName);

                    if (selectedAuthorities.indexOf(providerResult.authority) === -1) {
                        selectedAuthorities.push(providerResult.authority);
                    }
                }
            }

            publishVM.numberOfProviders = selectedProviders.length;

            publishVM.localAuthorities = new calculateFunding.controls.ExpanderViewModel(selectedAuthorities);

            publishVM.providerTypes = new calculateFunding.controls.ExpanderViewModel(selectedProviders);

            this.publishDetails(publishVM);

            this.pageState("confirmPublish");

            this.notificationMessage(null);
        }

        /** Publish the selected allocation lines */
        publish() {

            this.callChangeStatusEndpoint(StatusAction.Publish);
        }
      
        /** This provides a shortcut to evaluating the UI for performing the select all operation */
        private executingSelectAll: KnockoutObservable<boolean> = ko.observable(false);

        /** Select all allocation line results across all results for the current filter */
        selectAll: KnockoutComputed<boolean> = ko.computed({
            read: function () {

                if (this.executingSelectAll()) { return false; }

                let filteredResults = this.filteredResults();

                for (let i = 0; i < filteredResults.length; i++) {

                    let providerResult = filteredResults[i];

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

                let self = this;

                setTimeout(function () {

                    self.executingSelectAll(true);

                    let filteredResults = self.filteredResults();

                    for (let i = 0; i < filteredResults.length; i++) {

                        let providerResult = filteredResults[i];

                        providerResult.isSelected(newValue);
                    }

                    self.executingSelectAll(false);
                }, 1);
            }
        }, this);

        /** Expand a provider result line to show the allocation lines and qa results */
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

        /**
         * Request that the funding snapshot is refreshed
         * As the process is asynchronous is sets up a poll mechanism to check on the progress
         * */
        refreshFundingSnapshot() {

            this.workingMessage("Refreshing funding values for providers");

            this.isWorkingVisible(true);

            let refreshPublishedResultsUrl = this.settings.refreshPublishedResultsUrl.replace("{specificationId}", this.selectedSpecification().id);

            let executeCalcRequest = $.ajax({
                url: refreshPublishedResultsUrl,
                dataType: "json",
                method: "POST",
                contentType: "application/json"
            })
                .done((response) => {

                    this.pollCalculationProgress();
                })
                .fail((response) => {

                    this.notificationMessage("There was a problem starting the refresh.");

                    this.notificationStatus("error");

                    this.isWorkingVisible(false);
                });
        }

        /** Polls for the current status of a refresh operation */
        private pollCalculationProgress() {
            window.setTimeout(() => {
                let checkRefreshStateResponse = $.ajax({
                    url: this.settings.checkPublishResultsStatusUrl.replace("{specificationId}", this.selectedSpecification().id),
                    dataType: "json",
                    method: "POST",
                    contentType: "application/json"
                })
                    .always((response) => {
                        let status = new SpecificationExecutionStatus(response.specificationId, response.percentageCompleted, response.calculationProgress, response.errorMessage);

                        if (status.calculationProgressStatus === CalculationProgressStatus.InProgress
                            || status.calculationProgressStatus === CalculationProgressStatus.NotStarted) {
                            // Update the percent complete
                            this.workingPercentComplete(status.percentageCompleted);

                            this.pollCalculationProgress();
                        }
                        else if (status.calculationProgressStatus === CalculationProgressStatus.Error) {
                            // The refresh has failed
                            this.notificationMessage("Unable to refresh allocation line funding values");

                            this.notificationStatus("error");

                            this.workingPercentComplete(null);

                            this.isWorkingVisible(false);
                        }
                        else if (status.calculationProgressStatus === CalculationProgressStatus.Finished) {
                            // Refresh has completed successfully so reload the data
                            this.workingPercentComplete(null);

                            this.isWorkingVisible(false);

                            this.notificationMessage("Allocation line funding values refreshed successfully.");

                            this.notificationStatus("success");
                        }
                    });

            }, 500);
        }

        /** On click of the button, map the response and load results */
        public viewFunding(): void {
            if (this.state() !== "idle")
                return;
            let self = this;

            let viewfundingPageUrl = self.settings.viewFundingPageUrl.replace("{fundingPeriodId}", self.selectedFundingPeriod().id);

            viewfundingPageUrl = viewfundingPageUrl.replace("{specificationId}", self.selectedSpecification().id);

            viewfundingPageUrl = viewfundingPageUrl.replace("{fundingstreamId}", self.selectedFundingStream().id);

            let viewFundingRequest = $.ajax({
                url: viewfundingPageUrl,
                dataType: "json",
                method: "GET",
                contentType: "application/json"
            });

            self.state("Loading");

            viewFundingRequest.done((response) => {
                if (response) {

                    let viewFundingResponse: KnockoutObservableArray<PublishedProviderResultViewModel> = response;

                    self.bindViewFundingResponseToModel(viewFundingResponse);

                    self.pageState("main");
                }
            });
        }

        public bindViewFundingResponseToModel(response: any) {

            if (response !== null && response !== undefined) {

                let publishedProviderArray: Array<IProviderResultsResponse> = response;

                let providers: Array<PublishedProviderResultViewModel> = [];

                for (let p in publishedProviderArray) {

                    let provider: IProviderResultsResponse = publishedProviderArray[p];

                    let providerObservable: PublishedProviderResultViewModel = new PublishedProviderResultViewModel();

                    // Here we need to go and set the provider properties
                    providerObservable.providerId = provider.providerId;

                    providerObservable.providerName = provider.providerName;

                    providerObservable.fundingAmount = provider.fundingAmount;

                    providerObservable.numberApproved = provider.numberApproved;

                    providerObservable.numberUpdated = provider.numberUpdated;

                    providerObservable.numberNew = provider.numberHeld;

                    providerObservable.numberPublished = provider.numberPublished;

                    providerObservable.totalAllocationLines = provider.totalAllocationLines;

                    for (let f in provider.fundingStreamResults) {

                        let fundingStream: IFundingStreamResultResponse = provider.fundingStreamResults[f];

                        for (let a in fundingStream.allocationLineResults) {

                            let allocationLine: IAllocationLineResultsResponse = fundingStream.allocationLineResults[a];

                            let allocationLineObservable: PublishedAllocationLineResultViewModel = new PublishedAllocationLineResultViewModel();

                            // set the properties 
                            allocationLineObservable.allocationLineId = allocationLine.allocationLineId;

                            allocationLineObservable.allocationLineName = allocationLine.allocationLineName;

                            allocationLineObservable.fundingAmount = allocationLine.fundingAmount;

                            allocationLineObservable.lastUpdated = allocationLine.lastUpdated;

                            allocationLineObservable.status = allocationLine.status;

                            allocationLineObservable.version = "1.0" //allocationLine.

                            // bit of contention here
                            providerObservable.authority = allocationLine.authority;

                            providerObservable.allocationLineResults.push(allocationLineObservable);
                        }
                    }
                    providers.push(providerObservable)
                }
                this.allProviderResults(providers);
            }
        }
    }

    /** Execution status for a specification */
    class SpecificationExecutionStatus {
        specificationId: string;

        percentageCompleted: number;

        calculationProgressStatus: CalculationProgressStatus;

        errorMessage: string;

        constructor(specificationId: string, percentageCompleted: number, calculationProgressStatus: CalculationProgressStatus, errorMessage: string) {

            this.specificationId = specificationId;

            this.percentageCompleted = percentageCompleted;

            this.calculationProgressStatus = calculationProgressStatus;
        }
    }

    /** Possible states for a refresh funding operation */
    enum CalculationProgressStatus {
        NotStarted,
        InProgress,
        Error,
        Finished
    }
    
    /** A published provider result */
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

        /** 
         *  Are all allocation lines in the provider currently selected.
         *  Note: there is no direct selection of a provider line, it is all based on whether the child allocation lines are selected
         */
        isSelected: KnockoutComputed<boolean> = ko.computed({

            read: function () {

                let allocationResults = this();

                for (let i = 0; i < allocationResults.length; i++) {

                    let allocationLineResult = allocationResults[i];

                    if (!allocationLineResult.isSelected()) {

                        return false;
                    }
                }

                return true;
            },
            write: function (newValue) {

                let allocationResults = this();

                for (let i = 0; i < allocationResults.length; i++) {

                    let allocationLineResult = allocationResults[i];

                    if (allocationLineResult.isSelected.peek() !== newValue) {

                        allocationLineResult.isSelected(newValue);
                    }
                }
            }
        }, this.allocationLineResults);
    }

    /** A published allocation line result */
    class PublishedAllocationLineResultViewModel {

        allocationLineId: string;

        allocationLineName: string;

        status: AllocationLineStatus;

        fundingAmount: number;

        lastUpdated: string;

        authority: string;

        get fundingAmountDisplay(): string {

            return (Number(this.fundingAmount)).toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
        }

        version: string;

        isSelected: KnockoutObservable<boolean> = ko.observable(false);
    }


    export interface IFundingStreamResultResponse {

        allocationLineResults: Array<IAllocationLineResultsResponse>;

        fundingStreamName: string;

        fundingStreamId: string;

        fundingAmount: number;

        lastUpdated: string;

        numberHeld: number;

        numberApproved: number;

        numberUpdated: number;

        numberPublished: number;

        totalAllocationLines: number;
    }

    export interface IAllocationLineResultsResponse {
        allocationLineId: string;

        allocationLineName: string;

        fundingAmount: number;

        status: number;

        lastUpdated: string;

        authority: string;
    }

    export interface IProviderResultsResponse {
        fundingStreamResults: Array<IFundingStreamResultResponse>

        specificationId: string;

        providerName: string;

        providerId: string;

        ukprn: string;

        fundingAmount: number;

        totalAllocationLines: number;

        numberHeld: number;

        numberApproved: number;

        numberPublished: number;

        numberUpdated: number;

        lastUpdated: string;

        authority: string;
    }

    /** The allowable statuses of an allocation line */
    export enum AllocationLineStatus {
        Held,
        Approved,
        Published,
        Updated
    }

    /** The settings */
    interface IViewFundingSettings {

        testScenarioQueryUrl: string;

        viewFundingPageUrl: string;

        antiforgeryToken: string;

        approveAllocationLinesUrl: string;

        refreshPublishedResultsUrl: string;

        checkPublishResultsStatusUrl: string;

        fundingPeriodUrl: string;

        specificationsUrl: string;

        fundingStreamsUrl: string;
    }

    /** The response of retrieving qa results */
    interface IQAResultResponse {

        passed: number;

        failed: number;

        ignored: number;

        testCoverage: number;
    }

    /** A summary of the data to be approved or published */
    class ConfirmPublishApproveViewModel {

        numberOfProviders: number;

        providerTypes: calculateFunding.controls.ExpanderViewModel = new calculateFunding.controls.ExpanderViewModel([]);

        localAuthorities: calculateFunding.controls.ExpanderViewModel = new calculateFunding.controls.ExpanderViewModel([]);

        allocationLines: Array<AllocationLineSummaryViewModel> = [];

        totalFundingApproved: number = 0;

        get totalFundingApprovedDisplay(): string {
            return "£" + (Number(this.totalFundingApproved)).toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
        }
    }

    /** A summary of a selected allocation line */
    class AllocationLineSummaryViewModel {
        providerId: string;

        allocationLineId: string;

        name: string;

        value: number;

        constructor(providerId: string, allocationLineId: string, name: string, value: number) {

            this.providerId = providerId;

            this.allocationLineId = allocationLineId;

            this.name = name;

            this.value = value;
        }

        get valueDisplay(): string {

            return "£" + (Number(this.value)).toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
        }
    }

    /** Possible actions for changing status of an allocation line */
    enum StatusAction {
        Approve,
        Publish
    }

    /** Model submited to the backend to change the status of allocation lines */
    class PublishedAllocationLineResultStatusUpdateViewModel {

        Status: AllocationLineStatus;

        Providers: Array<PublishedAllocationLineResultStatusUpdateProviderViewModel> = [];
    }

    /** Details of an allocation line that needs it status changing */
    class PublishedAllocationLineResultStatusUpdateProviderViewModel {
        ProviderId: string;

        AllocationLineId: string;

        constructor(providerId: string, allocationLineId: string) {

            this.ProviderId = providerId;

            this.AllocationLineId = allocationLineId;
        }
    }

    /** Funding period dropdown options */
    export class FundingPeriodResponse {
        constructor(id: string, value: string) {

            this.id = id;

            this.value = value;
        }
        id: string;

        value: string;
    }

    /** Specification dropdown options  */
    export class SpecificationResponse {
        constructor(id: string, value: string, fundingStreams: Array<any>) {

            this.id = id;

            this.value = value;

            this.fundingstreams = fundingStreams;
        }
        id: string;

        value: string;

        fundingstreams: Array<FundingStreamResponse>;
    }

    /** Funding stream dropdown options  */
    export class FundingStreamResponse {
        constructor(id: string, name: string) {

            this.id = id;

            this.name = name;
        }
        id: string;

        name: string;
    }
}