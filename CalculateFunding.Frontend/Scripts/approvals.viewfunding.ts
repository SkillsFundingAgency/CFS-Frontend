/// <reference path="./notifications.ts" />

namespace calculateFunding.approvals {
    /** Main view model that the page will be bound to */
    export class ViewFundingViewModel extends calculateFunding.notifications.NotificationsViewModel {
        private settings: IViewFundingSettings;
        public isLoadingVisible: KnockoutComputed<boolean>;
        
        public FundingPeriods: KnockoutObservableArray<FundingPeriodResponse> = ko.observableArray();
        public Specifications: KnockoutObservableArray<SpecificationResponse> = ko.observableArray();
        public FundingStreams: KnockoutObservableArray<FundingStreamResponse> = ko.observableArray();
        public selectedFundingPeriod: KnockoutObservable<FundingPeriodResponse> = ko.observable();
        public selectedSpecification: KnockoutObservable<SpecificationResponse> = ko.observable();
        public selectedFundingStream: KnockoutObservable<FundingStreamResponse> = ko.observable();
        public pageState: KnockoutObservable<string> = ko.observable("initial");
        public workingMessage: KnockoutObservable<string> = ko.observable(null);
        public isWorkingVisible: KnockoutObservable<boolean> = ko.observable(false);
        public workingPercentComplete: KnockoutObservable<number> = ko.observable(null);
        public notificationMessage: KnockoutObservable<string> = ko.observable(null);
        public notificationStatus: KnockoutObservable<string> = ko.observable();
        public pageNumber: KnockoutObservable<number> = ko.observable(0);
        public itemsPerPage: number = 500;
        public updatedCount: KnockoutObservable<number> = ko.observable(0);
        public limitVisiblePageNumbers: number = 5;
        public allProviderResults: KnockoutObservableArray<PublishedProviderResultViewModel> = ko.observableArray([]);
        public dataLoadState: KnockoutObservable<string> = ko.observable("idle");
        public totalNumberAllocationLines: KnockoutObservable<number> = ko.observable(0);
        public isPublishButtonEnabled: boolean;
        public isPublishAndApprovePageFiltersEnabled: boolean;
        public shouldApprovalServerSideBatchingBeUsed: boolean;
        public approveSearchModel = new calculateFunding.approvals.ApproveAndPublishSearchViewModel();
        public permissions: KnockoutObservable<SpecificationPermissions> = ko.observable(new SpecificationPermissions(false, false, false));

        constructor(settings: IViewFundingSettings) {
            super();

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
            else if (typeof settings.viewFundingPageUrl !== undefined && !settings.viewFundingPageUrl) {
                throw "Settings must contain the view funding page query url";
            }
            else if (typeof settings.fundingPeriodUrl !== "undefined" && !settings.fundingPeriodUrl) {
                throw "Settings must contain the funding period query url";
            }
            else if (typeof settings.fundingStreamsUrl !== "undefined" && !settings.fundingStreamsUrl) {
                throw "Settings must contain the fuding streams query url";
            }
            else if (typeof settings.specificationsUrl !== "undefined" && !settings.specificationsUrl) {
                throw "Settings must contain the specifications query url";
            }
            else if (typeof settings.permissionsUrl !== "undefined" && !settings.permissionsUrl) {
                throw "Settings must contain the permissions query url";
            }
            else if (typeof settings.latestJobUrl !== "undefined" && !settings.latestJobUrl) {
                throw "Settings must contain the latest jobs url";
            }

            let self = this;
            self.settings = settings;

            // Defer updates on the array of items being bound to the page, so updates don't constantly to the UI and slow things down
            self.currentPageResults.extend({ deferred: true });

            // Defer updates on functions that determine whether the approve and publish buttons are enabled, so updates don't constantly to the UI and slow things down
            self.canApprove.extend({ deferred: true });
            self.canPublish.extend({ deferred: true });
            self.numberAllocationLinesSelected.extend({ deferred: true });

            self.pageState() == "initial";

            /** Request to get the funding periods */
            this.loadFundingPeriods();

            /** When a funding period is selected then load the specifications for that funding period */
            this.selectedFundingPeriod.subscribe(function () {
                if (self.selectedFundingPeriod() !== undefined && self.selectedFundingPeriod().value !== "Select") {
                    /** Load Specifications in the specification dropdown */
                    let getSpecificationForSelectedPeriodUrl = self.settings.specificationsUrl.replace("{fundingPeriodId}", self.selectedFundingPeriod().id);
                    let specificationRequest = $.ajax({
                        url: getSpecificationForSelectedPeriodUrl,
                        dataType: "json",
                        method: "get",
                        contentType: "application/json",
                    })
                        .done(function (response) {
                            let newSpecificationArray = Array<SpecificationResponse>();
                            ko.utils.arrayForEach(response, function (item: any) {
                                let specResponse = new SpecificationResponse(item.id, item.name, item.publishedResultsRefreshedAt, item.fundingStreams);
                                newSpecificationArray.push(specResponse);
                            });
                            self.Specifications(newSpecificationArray);

                            // If query string contains a specification id then try and pre-select it
                            let givenSpec: string = self.getQueryStringValue("specificationId");
                            if (givenSpec) {
                                let foundItem = ko.utils.arrayFirst(newSpecificationArray, function (item) {
                                    return item.id == givenSpec;
                                });

                                if (foundItem) {
                                    self.selectedSpecification(foundItem);
                                }
                            }
                        })
                        .fail((response) => {
                            self.notificationMessage("There was a problem retreiving the Specifications, please try again.");
                            self.notificationStatus("error");
                        });
                }
                else {
                    self.Specifications([]);
                }
            });

            /** When a specification is selected then load the funding streams for that specification */
            self.selectedSpecification.subscribe(function () {
                if (self.selectedSpecification() !== undefined && self.selectedFundingPeriod().value !== "Select") {
                    let newFundingStreamArray = Array<FundingStreamResponse>();
                    let spec = ko.utils.arrayFirst(self.Specifications(),
                        function (item: SpecificationResponse) {
                            return (item.id === self.selectedSpecification().id);
                        });
                    self.FundingStreams(spec.fundingstreams);
                }
                else {
                    self.FundingStreams([]);
                }
            });
        }

        //***********************
        // Notifications methods
        //***********************
        currentJobType: KnockoutObservable<string> = ko.observable("");
        isJobRunning: KnockoutObservable<boolean> = ko.observable(false);
        jobSuccessMessage: string;
        jobFailureMessage: string;

        protected onConnected(): void {
            // Doesn't immediatley subscribe to any groups, has to wait until user has chosen the specification details to view the funding details for
        }

        protected onJobStarted(jobType: string): void {
            console.log("received notification of job started: " + jobType);
            this.currentJobType(jobType);
            this.isJobRunning(true);

            if (jobType === "CreateInstructAllocationLineResultStatusUpdateJob") {
                if (!this.isWorkingVisible()) {
                    // This handles the case when user navigates to page and there is a job already running
                    this.workingMessage("Approving or Publishing Items.");
                    this.isWorkingVisible(true);
                }
            }
        }

        protected onJobCompleted(status: calculateFunding.notifications.CompletionStatus): void {
            console.log("received completed notification of job type: " + this.currentJobType());

            if (status === calculateFunding.notifications.CompletionStatus.Succeeded) {
                console.log("job completed successfully");

                if (this.currentJobType() === "CreateInstructAllocationLineResultStatusUpdateJob") {
                    if (!this.jobSuccessMessage) {
                        // This handles the case when user navigates to page and there is a job already running
                        this.jobSuccessMessage = "The status has successfully been transitioned for some items.";
                    }

                    this.isWorkingVisible(false);
                    this.notificationMessage(this.jobSuccessMessage);
                    this.notificationStatus('success');

                    // Once finished need to reload the page to get new data and reset selection    
                    this.dataLoadState("idle");
                    this.loadProviderResults();
                }
            }
            else if (status === calculateFunding.notifications.CompletionStatus.Failed || status === calculateFunding.notifications.CompletionStatus.Cancelled || status === calculateFunding.notifications.CompletionStatus.TimedOut) {
                console.log("job was terminated because: " + status);

                if (!this.jobFailureMessage && this.currentJobType() === "CreateInstructAllocationLineResultStatusUpdateJob") {
                    // This handles the case when user navigates to page and there is a job already running
                    this.jobSuccessMessage = "There was an error chanign the status of some items.";
                }

                this.notificationMessage(this.jobFailureMessage);
                this.notificationStatus('error');
                this.dismissConfirmPage();
            }
        }

        //******************************
        // End of Notifications methods
        //******************************

        numberAllocationLinesSelected: KnockoutComputed<number> = ko.pureComputed(function () {
            let providerResults = this.allProviderResults();
            let count = 0;
            for (let i = 0; i < providerResults.length; i++) {
                let allocationResults = providerResults[i].allocationLineResults();
                for (let j = 0; j < allocationResults.length; j++) {
                    let allocationLineResult = allocationResults[j];
                    if (allocationLineResult.isSelected()) {
                        count++;
                    }
                }
            }
            return count;
        }, this);

        filteredResults: KnockoutComputed<Array<PublishedProviderResultViewModel>> = ko.pureComputed(function () {
            let allResultsRaw: Array<PublishedProviderResultViewModel> = this.allProviderResults();
            this.collapseAllAllocationLines();
            if (this.isPublishAndApprovePageFiltersEnabled) {
                this.pageNumber(0);
                if (this.approveSearchModel.allSearchFacets && this.approveSearchModel.allSearchFacets().length != 0) {
                    return this.approveSearchModel.filterResults(allResultsRaw);
                }
            }
            return allResultsRaw;
        }, this);

        collapseAllAllocationLines(): void {
            $(".expander-container").hide();
            $(".expander-trigger-row-open").removeClass("expander-trigger-row-open");
            $(".expander-trigger-cell-open").removeClass("expander-trigger-cell-open");
        }

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

        /** Creates the units of work to change the status of selected allocation lines */
        private callChangeStatusEndpoint(action: StatusAction) {

            let selectedItems = this.approvalDetails();
            let successMessage = "The status has successfully been transitioned to the Approved state for the selected items.";
            let failureMessage = "There was an error setting the status of the items to Approved.";
            let changeStatusUrl = this.settings.approveAllocationLinesUrl.replace("{specificationId}", this.selectedSpecification().id);
            this.workingMessage("Approving items.");

            if (action === StatusAction.Publish) {
                this.workingMessage("Publishing items.");

                selectedItems = this.publishDetails();
                successMessage = "The status has successfully been transitioned to the Published state for the selected items.";
                failureMessage = "There was an error setting the status of the items to Published.";
            }

            this.isWorkingVisible(true);

            if (this.shouldApprovalServerSideBatchingBeUsed) {

                let publishedAllocationLineResultStatusUpdatesViewModel = new PublishedAllocationLineResultStatusUpdateViewModel()
                publishedAllocationLineResultStatusUpdatesViewModel.Status = AllocationLineStatus.Approved;
                if (action === StatusAction.Publish) {
                    // Change the variables if the action is publish
                    publishedAllocationLineResultStatusUpdatesViewModel.Status = AllocationLineStatus.Published;
                }

                selectedItems.allocationLines.forEach((element) => {

                    publishedAllocationLineResultStatusUpdatesViewModel.Providers.push(new PublishedAllocationLineResultStatusUpdateProviderViewModel(element.providerId, element.allocationLineId));
                });

                this.jobFailureMessage = failureMessage;
                this.jobSuccessMessage = successMessage;

                let self = this;

                $.ajax({
                    url: changeStatusUrl,
                    method: "PUT",
                    contentType: 'application/json',
                    data: JSON.stringify(publishedAllocationLineResultStatusUpdatesViewModel),
                    headers: {
                        RequestVerificationToken: self.settings.antiforgeryToken
                    }
                })
                .done((result) => {
                    console.log("successfully submitted request to change allocation line status");
                })
                .fail((ex) => {
                    console.log("error submitting request to change allocation line status: " + ex);

                    this.notificationMessage(failureMessage);
                    this.notificationStatus('error');
                    this.dismissConfirmPage();
                })
            }
            else {
                let batchSize: number = 250;
                let tasks: Array<PublishedAllocationLineResultStatusUpdateViewModel> = [];

                let numBatches: number = Math.ceil(selectedItems.allocationLines.length / batchSize);

                for (let j = 0; j < numBatches; j++) {
                    let updateModel = new PublishedAllocationLineResultStatusUpdateViewModel();
                    updateModel.Status = AllocationLineStatus.Approved;
                    if (action === StatusAction.Publish) {
                        // Change the variables if the action is publish
                        updateModel.Status = AllocationLineStatus.Published;
                    }

                    let start = j * batchSize;

                    for (let i = start; i < start + batchSize; i++) {
                        let selectedItem = selectedItems.allocationLines[i];
                        if (selectedItem === undefined) {
                            break;
                        }

                        updateModel.Providers.push(new PublishedAllocationLineResultStatusUpdateProviderViewModel(selectedItem.providerId, selectedItem.allocationLineId));
                    }

                    tasks.push(updateModel);
                }

                this.executeStatusChange(tasks, 0, changeStatusUrl, successMessage, failureMessage);
            }
        }

        /** Execute a unit of work by calling the change status endpoint */
        private executeStatusChange(tasks: Array<PublishedAllocationLineResultStatusUpdateViewModel>, currentTask: number, changeStatusUrl: string, successMessage: string, failureMessage: string) {
            if (currentTask >= tasks.length) {
                this.isWorkingVisible(false);
                this.notificationMessage(successMessage);
                this.notificationStatus('success');

                // Once finished need to reload the page to get new data and reset selection    
                this.dataLoadState("idle");
                this.loadProviderResults();

                return;
            }

            let self = this;

            $.ajax({
                url: changeStatusUrl,
                method: "PUT",
                contentType: 'application/json',
                data: JSON.stringify(tasks[currentTask]),
                headers: {
                    RequestVerificationToken: self.settings.antiforgeryToken
                }
            })
                .done((result) => {
                    self.executeStatusChange(tasks, currentTask + 1, changeStatusUrl, successMessage, failureMessage);
                })
                .fail((ex) => {
                    this.notificationMessage(failureMessage);
                    this.notificationStatus('error');
                    this.dismissConfirmPage();
                })
        }

        /** Has the used selected at least one allocation line result that can be approved */
        canApprove: KnockoutComputed<boolean> = ko.computed(function () {
            if (!this.permissions().canApprove) {
                return false;
            }

            let providerResults = this.allProviderResults();
            for (let i = 0; i < providerResults.length; i++) {
                let allocationResults = providerResults[i].allocationLineResults();
                for (let j = 0; j < allocationResults.length; j++) {
                    let allocationLineResult = allocationResults[j];
                    if (allocationLineResult.isSelected() && (allocationLineResult.status === AllocationLineStatus.New || allocationLineResult.status === AllocationLineStatus.Updated)) {
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
                    if (allocationResult.isSelected() && (allocationResult.status === AllocationLineStatus.New || allocationResult.status === AllocationLineStatus.Updated)) {
                        approveVM.allocationLines.push(new AllocationLineSummaryViewModel(providerResult.providerId, allocationResult.allocationLineId, allocationResult.allocationLineName, allocationResult.fundingAmount));
                        approveVM.totalFundingApproved += allocationResult.fundingAmount;
                        providerHasSelectedAllocations = true;

                        let foundRollup = ko.utils.arrayFirst(approveVM.allocationLinesRollup, function (item) {
                            return item.name === allocationResult.allocationLineName;
                        });

                        if (!foundRollup) {
                            foundRollup = new AllocationLineRollupViewModel();
                            foundRollup.name = allocationResult.allocationLineName;
                            foundRollup.value = 0;
                            approveVM.allocationLinesRollup.push(foundRollup);
                        }

                        foundRollup.value += allocationResult.fundingAmount;
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
            this.notificationStatus("");
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
            // Disable the publish button if the user doesn't have permissions or is not enabled (Story #62313)
            if (!this.isPublishButtonEnabled || !this.permissions().canPublish) {
                return false;
            }

            let providerResults = this.allProviderResults();
            for (let i = 0; i < providerResults.length; i++) {
                let allocationResults = providerResults[i].allocationLineResults();
                for (let j = 0; j < allocationResults.length; j++) {
                    let allocationLineResult = allocationResults[j];
                    if (allocationLineResult.isSelected() && allocationLineResult.status === AllocationLineStatus.Approved) {
                        return true;
                    }
                }
            }
            return false;
        }, this);

        doesUserHaveAllPermissions: KnockoutComputed<boolean> = ko.pureComputed(function () {
            return this.permissions().doesUserHaveAllPermissions();
        }, this);

        userPermissionsText: KnockoutComputed<string> = ko.pureComputed(function () {
            return this.permissions().generatePermissionsDeniedText();
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
                    if (allocationResult.isSelected() && allocationResult.status === AllocationLineStatus.Approved) {
                        publishVM.allocationLines.push(new AllocationLineSummaryViewModel(providerResult.providerId, allocationResult.allocationLineId, allocationResult.allocationLineName, allocationResult.fundingAmount));
                        publishVM.totalFundingApproved += allocationResult.fundingAmount;
                        providerHasSelectedAllocations = true;

                        let foundRollup = ko.utils.arrayFirst(publishVM.allocationLinesRollup, function (item) {
                            return item.name === allocationResult.allocationLineName;
                        });

                        if (!foundRollup) {
                            foundRollup = new AllocationLineRollupViewModel();
                            foundRollup.name = allocationResult.allocationLineName;
                            foundRollup.value = 0;
                            publishVM.allocationLinesRollup.push(foundRollup);
                        }

                        foundRollup.value += allocationResult.fundingAmount;
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
            this.notificationStatus("");
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
                    let allocationLineResultsFiltered = providerResult.allocationLineResultsFiltered();
                    for (let j = 0; j < allocationLineResultsFiltered.length; j++) {
                        let allocationLineResult = allocationLineResultsFiltered[j];
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
                let getQAResultsUrl = parentVM.settings.testScenarioQueryUrl.replace("{specificationId}", parentVM.selectedSpecification().id);
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

        /** Is the refresh button enabled */
        canRefreshFunding: KnockoutComputed<boolean> = ko.pureComputed(function () {
            return this.permissions().canRefresh;
        }, this);

        /**
         * Request that the funding snapshot is refreshed
         * As the process is asynchronous is sets up a poll mechanism to check on the progress
         * */
        refreshFundingSnapshot() {
            this.notificationMessage('');
            this.workingMessage("Refreshing funding values for providers");
            this.isWorkingVisible(true);
            this.notificationStatus("");

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
                    // this.notificationMessage("There was a problem starting the refresh.");
                    this.notificationStatus("refreshError");
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
                        if (!response) {
                            this.notificationMessage("Unable to find status details for requested refresh");
                            this.notificationStatus("error");
                            this.workingPercentComplete(null);
                            this.isWorkingVisible(false);
                        }

                        let status = new SpecificationExecutionStatus(response.specificationId, response.percentageCompleted, response.calculationProgress, response.errorMessage, response.publishedResultsRefreshedAt, response.approvedCount, response.publishedCount, response.updatedCount);

                        if (status.calculationProgressStatus === CalculationProgressStatus.InProgress
                            || status.calculationProgressStatus === CalculationProgressStatus.NotStarted) {
                            // Update the percent complete
                            this.workingPercentComplete(status.percentageCompleted);
                            this.pollCalculationProgress();
                        }
                        else if (status.calculationProgressStatus === CalculationProgressStatus.Error) {
                            // The refresh has failed
                            //this.notificationMessage("There was an error refreshing the allocation line funding values - " + status.errorMessage);
                            this.notificationStatus("refreshError");
                            this.workingPercentComplete(null);
                            this.isWorkingVisible(false);
                        }
                        else if (status.calculationProgressStatus === CalculationProgressStatus.Finished) {
                            // Refresh has completed successfully so reload the data
                            let message = "";

                            if (!status.hasChanges) {
                                this.notificationStatus("refreshNotUpdated");
                                message = "Allocation line funding values refreshed successfully, no values have changed";
                            }
                            else {
                                this.notificationStatus("refreshUpdated");
                                this.updatedCount(response.updatedCount);
                            }
                            this.workingPercentComplete(null);
                            this.isWorkingVisible(false);

                            this.loadProviderResults();

                            this.selectedSpecification().publishedResultsRefreshedAt(status.publishedResultsRefreshedAt)
                        }
                    });

            }, 5000);
        }

        /** When the View Funding button is pressed, then load the funding results for the criteria and display them */
        public viewFunding(): void {
            this.pageState("main");
            this.notificationMessage('');

            this.loadUserPermissions();

            this.loadProviderResults();

            if (this.shouldApprovalServerSideBatchingBeUsed) {
                // Start watching for job notifications for the selected specification
                this.startWatchingForSpecificationNotifications(this.selectedSpecification().id);

                this.retrieveLatestJobStatus();
            }
        }

        private retrieveLatestJobStatus() {
            let self = this;

            let jobTypes = "CreateInstructAllocationLineResultStatusUpdateJob";
            let latestJobUrl = self.settings.latestJobUrl.replace("{specificationId}", self.selectedSpecification().id).replace("{jobTypes}", jobTypes);

            let latestJobRequest = $.ajax({
                url: latestJobUrl,
                dataType: "json",
                method: "GET",
                contentType: "application/json"
            })
                .done((response) => {
                    self.loadLatestJobStatus(response);
                })
                .fail((ex) => {
                    console.log("failed to retrieve latest job status");
                });
        }

        /** Load the permissions the user has to control what actions are available */
        private loadUserPermissions() {
            let self = this;

            let permissionsUrl = self.settings.permissionsUrl.replace("{specificationId}", self.selectedSpecification().id);
            let permissionsRequest = $.ajax({
                url: permissionsUrl,
                dataType: "json",
                method: "GET",
                contentType: "application/json"
            })
                .done((response) => {
                    if (response) {
                        self.permissions(new SpecificationPermissions(response.canRefreshFunding, response.canApproveFunding, response.canPublishFunding));
                    }
                    else {
                        self.notificationMessage("There was a problem loading your permissions for the specification.");
                        self.notificationStatus("error");
                    }

                    self.pageState("main");
                })
                .fail((ex) => {
                    self.notificationMessage("There was a problem loading your permissions for the specification.");
                    self.notificationStatus("error");
                    self.pageState("main");
                });
        }

        /** Load the provider results from the back-end */
        private loadProviderResults() {
            if (this.dataLoadState() !== "idle") {
                return;
            }

            let self = this;
            self.workingMessage("Loading funding values for providers");
            self.isWorkingVisible(true);
            self.allProviderResults([]);

            let viewfundingPageUrl = self.settings.viewFundingPageUrl.replace("{fundingPeriodId}", self.selectedFundingPeriod().id);
            viewfundingPageUrl = viewfundingPageUrl.replace("{specificationId}", self.selectedSpecification().id);
            viewfundingPageUrl = viewfundingPageUrl.replace("{fundingstreamId}", self.selectedFundingStream().id);
            let viewFundingRequest = $.ajax({
                url: viewfundingPageUrl,
                dataType: "json",
                method: "GET",
                contentType: "application/json"
            });

            viewFundingRequest.done((response) => {
                if (response) {
                    self.pageState("main");
                    self.bindViewFundingResponseToModel(response);
                }
                else {
                    self.pageState("initial");
                    self.notificationMessage("There was a problem loading the funding for the specification, please try again.");
                    self.notificationStatus("error");
                }

                self.isWorkingVisible(false);
                self.dataLoadState("idle");
            });

            viewFundingRequest.fail((response) => {
                self.pageState("initial");
                self.notificationMessage("There was a problem loading the funding for the specification, please try again.");
                self.notificationStatus("error");
                self.isWorkingVisible(false);
                self.dataLoadState("idle");
            });
        };

        private bindViewFundingResponseToModel(response: any) {
            if (response !== null && response !== undefined) {
                let receivedProviders: Array<IProviderResultsResponse> = response;
                let providers: Array<PublishedProviderResultViewModel> = [];

                let numberAllocationLines = 0;

                for (let p: number = 0; p < receivedProviders.length; p++) {
                    let receivedProvider: IProviderResultsResponse = receivedProviders[p];
                    let newProvider: PublishedProviderResultViewModel = new PublishedProviderResultViewModel();

                    // Here we need to go and set the provider properties
                    newProvider.providerId = receivedProvider.providerId;
                    newProvider.providerName = receivedProvider.providerName;
                    newProvider.providerType = receivedProvider.providerType;

                    for (let fs: number = 0; fs < receivedProvider.fundingStreamResults.length; fs++) {
                        let fundingStream: IFundingStreamResultResponse = receivedProvider.fundingStreamResults[fs];
                        for (let a: number = 0; a < fundingStream.allocationLineResults.length; a++) {
                            let receivedAllocationLine: IAllocationLineResultsResponse = fundingStream.allocationLineResults[a];
                            let newAllocationLine: PublishedAllocationLineResultViewModel = new PublishedAllocationLineResultViewModel();

                            // set the properties 
                            newAllocationLine.allocationLineId = receivedAllocationLine.allocationLineId;
                            newAllocationLine.allocationLineName = receivedAllocationLine.allocationLineName;
                            newAllocationLine.fundingAmount = receivedAllocationLine.fundingAmount;
                            newAllocationLine.lastUpdated = receivedAllocationLine.lastUpdated;
                            newAllocationLine.status = receivedAllocationLine.status;
                            newAllocationLine.statusAsString = AllocationLineStatus[receivedAllocationLine.status];
                            newAllocationLine.version = receivedAllocationLine.version;

                            newProvider.authority = receivedAllocationLine.authority;
                            newProvider.allocationLineResults.push(newAllocationLine);
                            numberAllocationLines++;
                        }
                    }
                    providers.push(newProvider);
                }
                this.approveSearchModel.reflectSelectableFilters(providers);
                this.allProviderResults(providers);
                this.totalNumberAllocationLines(numberAllocationLines);
            }
        }

        public loadFundingPeriods() {
            let self = this;

            let fundingPeriodRequest = $.ajax({
                url: this.settings.fundingPeriodUrl,
                dataType: "json",
                method: "get",
                contentType: "application/json",
            })
                .done(function (response) {
                    let newPeriodArray = Array<FundingPeriodResponse>();
                    ko.utils.arrayForEach(response, function (item: any) {
                        let fpPeriodResponse = new FundingPeriodResponse(item.id, item.name);
                        newPeriodArray.push(fpPeriodResponse);
                    });
                    self.FundingPeriods(newPeriodArray);

                    // If the query string contains a funding period then try and pre-select it
                    let givenPeriod:string = self.getQueryStringValue("fundingPeriodId");
                    if (givenPeriod) {
                        let foundItem = ko.utils.arrayFirst(newPeriodArray, function (item) {
                            return item.id == givenPeriod;
                        });

                        if (foundItem) {
                            self.selectedFundingPeriod(foundItem);
                        }
                    }
                })
                .fail((response) => {
                    self.notificationMessage("There was a problem retreiving the funding periods, please try again");
                    self.notificationStatus("error");
                })
        }

        private getQueryStringValue(key:string) {
            return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }
    }

    /** Execution status for a specification */
    class SpecificationExecutionStatus {
        specificationId: string;
        percentageCompleted: number;
        calculationProgressStatus: CalculationProgressStatus;
        errorMessage: string;
        publishedResultsRefreshedAt: Date;
        approvedCount: number;
        publishedCount: number;
        updatedCount: number;
        hasChanges: boolean;

        constructor(specificationId: string, percentageCompleted: number, calculationProgressStatus: CalculationProgressStatus, errorMessage: string, publishedResultsRefreshedAt: Date, approvedCount: number, publishedCount: number, updatedCount: number) {
            this.specificationId = specificationId;
            this.percentageCompleted = percentageCompleted;
            this.calculationProgressStatus = calculationProgressStatus;
            this.errorMessage = errorMessage;
            this.publishedResultsRefreshedAt = publishedResultsRefreshedAt;
            this.approvedCount = approvedCount;
            this.updatedCount = updatedCount;
            this.publishedCount = publishedCount;
            this.hasChanges = (approvedCount + updatedCount + publishedCount) > 0;
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
    export class PublishedProviderResultViewModel {
        providerName: string;
        providerId: string;
        providerType: string
        ukprn: string;
        authority: string;
        fundingAmount: KnockoutComputed<number>;
        get fundingAmountDisplay(): string {

            return (Number(this.fundingAmount())).toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
        }

        totalAllocationLines: KnockoutComputed<Number>;
        numberNew: KnockoutComputed<number>;
        numberApproved: KnockoutComputed<number>
        numberUpdated: KnockoutComputed<number>;
        numberPublished: KnockoutComputed<number>;
        testCoveragePercent: number;
        testsPassed: number;
        testsTotal: number;

        allocationLineResults: KnockoutObservableArray<PublishedAllocationLineResultViewModel> = ko.observableArray([]);
        allocationLineResultsFiltered: KnockoutComputed<Array<PublishedAllocationLineResultViewModel>> = ko.pureComputed(function () {
            return ko.utils.arrayFilter(this.allocationLineResults(), function (p) {
                return !p.isFilteredOut();
            })
        }, this);

        qaTestResults: KnockoutObservable<IQAResultResponse> = ko.observable(null);
        qaTestResultsRequestStatus: KnockoutObservable<string> = ko.observable(null);

        constructor() {
            let self = this;
            this.allocationLineResults.extend({ deferred: true });
            this.numberNew = ko.computed(function () {
                return PublishedProviderResultViewModel.getTotalForStatus(self.allocationLineResultsFiltered(), AllocationLineStatus.New);
            });
            this.numberUpdated = ko.computed(function () {
                return PublishedProviderResultViewModel.getTotalForStatus(self.allocationLineResultsFiltered(), AllocationLineStatus.Updated)
            });
            this.numberPublished = ko.computed(function () {
                return PublishedProviderResultViewModel.getTotalForStatus(self.allocationLineResultsFiltered(), AllocationLineStatus.Published)
            });
            this.numberApproved = ko.computed(function () {
                return PublishedProviderResultViewModel.getTotalForStatus(self.allocationLineResultsFiltered(), AllocationLineStatus.Approved)
            });
            this.totalAllocationLines = ko.computed(function () {
                return self.allocationLineResultsFiltered().length;
            });
            this.fundingAmount = ko.computed(function () {
                let totalFunding: number = 0;
                ko.utils.arrayForEach(self.allocationLineResultsFiltered(), function (al: PublishedAllocationLineResultViewModel) {
                    totalFunding += al.fundingAmount;
                })
                return totalFunding;
            });
        }

        private static getTotalForStatus(allocationLineResultsFiltered: PublishedAllocationLineResultViewModel[] ,status: AllocationLineStatus) {
            return allocationLineResultsFiltered.filter(function (al) {
                return al.status === status;
            }).length
        }



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
        }, this.allocationLineResultsFiltered);
    }

    /** A published allocation line result */
    export class PublishedAllocationLineResultViewModel {
        allocationLineId: string;
        allocationLineName: string;
        status: AllocationLineStatus;
        statusAsString: string
        fundingAmount: number;
        lastUpdated: string;
        authority: string;
        get fundingAmountDisplay(): string {
            return (Number(this.fundingAmount)).toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
        }
        version: string;
        isSelected: KnockoutObservable<boolean> = ko.observable(false);
        isFilteredOut: KnockoutObservable<boolean> = ko.observable(false);
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
        version: string;
    }

    export interface IProviderResultsResponse {
        fundingStreamResults: Array<IFundingStreamResultResponse>
        specificationId: string;
        providerName: string;
        providerType:string
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
        New,
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
        permissionsUrl: string;
        latestJobUrl: string;
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

        allocationLinesRollup: Array<AllocationLineRollupViewModel> = [];
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

    /** Details for rollup of a set of allocation lines */
    class AllocationLineRollupViewModel {
        name: string;
        value: number;

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
        constructor(id: string, value: string, publishedResultsRefreshedAt: Date, fundingStreams: Array<any>) {
            this.id = id;
            this.value = value;
            this.publishedResultsRefreshedAt(publishedResultsRefreshedAt);
            this.fundingstreams = fundingStreams;
        }
        id: string;
        value: string;
        fundingstreams: Array<FundingStreamResponse>;
        publishedResultsRefreshedAt: KnockoutObservable<Date> = ko.observable();

        publishedResultsRefreshedAtDisplay: KnockoutComputed<string> = ko.computed(function () {
            if (this.publishedResultsRefreshedAt()) {
                let date: Date = new Date(this.publishedResultsRefreshedAt());
                let dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
                return date.toLocaleString('en-GB', dateOptions);
            }
            else {
                return 'Not available';
            }
        }, this);
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

    /** Permissions for the specification */
    class SpecificationPermissions {
        constructor(canRefresh: boolean, canApprove: boolean, canPublish: boolean) {
            this.canRefresh = canRefresh;
            this.canApprove = canApprove;
            this.canPublish = canPublish;
        }

        canRefresh: boolean;
        canApprove: boolean;
        canPublish: boolean;

        public doesUserHaveAllPermissions(): boolean {
            return this.canRefresh && this.canApprove && this.canPublish;
        }

        public generatePermissionsDeniedText(): string {
            let permissionsText: string[] = [];
            if (!this.canRefresh) {
                permissionsText.push("refresh");
            }
            if (!this.canApprove) {
                permissionsText.push("approve");
            }
            if (!this.canPublish) {
                permissionsText.push('publish');
            }

            let generatedText: string;
            if (permissionsText.length != 0) {
                generatedText = "You are not permitted to";
                for (let i = 0; i < permissionsText.length; i++) {
                    if (i == 0) {
                        generatedText += " " + permissionsText[i];
                    }
                    else {
                        generatedText += " or " + permissionsText[i];
                    }
                }
                generatedText += " funding values for this specification.";
            }
            return generatedText;
        }
    }
}