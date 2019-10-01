﻿/// <reference path="./notifications.ts" />

namespace calculateFunding.approvals {
    /** Main view model that the page will be bound to */
    export class ViewFundingViewModel extends calculateFunding.notifications.NotificationsViewModel {
        private settings: IViewFundingSettings;
        public isLoadingVisible: KnockoutComputed<boolean>;

        public FundingPeriods: KnockoutObservableArray<FundingPeriodResponse> = ko.observableArray();
        public FundingStreams: KnockoutObservableArray<FundingStreamResponse> = ko.observableArray();
        public selectedFundingPeriod: KnockoutObservable<FundingPeriodResponse> = ko.observable();
        public selectedSpecification: KnockoutObservable<SpecificationResponse> = ko.observable();
        public selectedSpecificationName: KnockoutComputed<string>;
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
        public approveSearchModel = new calculateFunding.approvals.ApproveAndPublishSearchViewModel();
        public permissions: KnockoutObservable<SpecificationPermissions> = ko.observable(new SpecificationPermissions(false, false, false));
        public selectedProviderView: KnockoutObservable<PublishedProviderResultViewModel> = ko.observable();
        public fundingPeriodStreams: Array<FundingPeriodStreams>;
        public providerViewSelectedTab: KnockoutObservable<ProviderViewSelectedTab> = ko.observable();
        public profileResults: KnockoutObservableArray<ProfileResultsViewModel> = ko.observableArray();
        public profileResult: KnockoutObservable<ProfileResultsViewModel> = ko.observable();

        private readonly instructCalculationsJobDefinitionId: string = "CreateInstructAllocationJob";
        private readonly instructAggregationsCalculationsJobDefinitionId: string = "CreateInstructGenerateAggregationsAllocationJob";
        public messageTemplateData: ITemplateData = { jobInvokerDisplayName: "", jobCreatedAt: "", modalTitle: "Unable to refresh funding" };
        public modalVisible: KnockoutObservable<boolean> = ko.observable(false);
        public bodyTemplate: KnockoutObservable<string> = ko.observable("blankTemplate");
        public bodyData: KnockoutComputed<any>;
        public modalSize: KnockoutObservable<string> = ko.observable('funding-modal');

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
            else if (typeof settings.specificationsFilteredUrl !== "undefined" && !settings.specificationsFilteredUrl) {
                throw "Settings must contain the specifications filter query url";
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
            self.filteredResultsSelectedAllocationTotal.extend({ deferred: true });
            self.filteredResultsSelectedAllocationTotalDisplay.extend({ deferred: true });

            self.pageState() === "initial";

            self.bodyData = ko.computed(function () {
                return self.messageTemplateData;
            });

            /** Request to get the funding streams */
            this.loadFundingStreams();

            this.selectedFundingStream.subscribe(function () {
                let fundingPeriods: Array<FundingPeriodResponse> = Array<FundingPeriodResponse>();
                if (self.selectedFundingStream() !== undefined && self.selectedFundingStream().name !== "Select") {
                    let fundingPeriodRequest = $.ajax({
                            url: self.settings.fundingPeriodUrl,
                            dataType: "json",
                            method: "get",
                            contentType: "application/json",
                        })
                        .done(function(response: Array<FundingPeriodResponse>) {
                            ko.utils.arrayForEach(self.fundingPeriodStreams,
                                function(fundingStreamPeriod: FundingPeriodStreams) {
                                    if (fundingPeriods
                                        .filter((filterperiod) => filterperiod.id ==
                                            fundingStreamPeriod.fundingPeriod.id).length ==
                                        0 &&
                                        fundingStreamPeriod.fundingStreams.filter((stream) => {
                                            return stream.id == self.selectedFundingStream().id;
                                        }).length >
                                        0) {
                                        let matchingPeriods: Array<FundingPeriodResponse> =
                                            ko.utils.arrayFilter(response,
                                                (item) => item.period == fundingStreamPeriod.fundingPeriod.name &&
                                                item.id == fundingStreamPeriod.fundingPeriod.id);
                                        if (matchingPeriods != undefined) {
                                            fundingPeriods =
                                                fundingPeriods.concat(matchingPeriods.filter(
                                                    (matchingPeriod: FundingPeriodResponse) => fundingPeriods
                                                    .filter((current) => current.id == matchingPeriod.id).length ===
                                                    0));
                                        }
                                    }
                                });

                            self.FundingPeriods(fundingPeriods);
                        })
                        .fail((response) => {
                            self.notificationMessage(
                                "There was a problem retreiving the funding periods, please try again");
                            self.notificationStatus("error");
                        });
                }
            });

            /** When a funding period is selected then load the specifications for that funding period and funding stream*/
            this.selectedFundingPeriod.subscribe(function () {
                self.PopulateSpecification(self);
            });

            /** When a funding stream is selected then load the specifications for that funding stream and funding period */
            this.selectedFundingStream.subscribe(function () {
                self.PopulateSpecification(self);
            });

            self.selectedSpecificationName = ko.computed(function () {
                if (self.selectedSpecification()) {
                    return self.selectedSpecification().name;
                }
                else {
                    return "";
                }
            });

            /** If the profile result isn't initialised the binding dies at page load */
            this.profileResult(new ProfileResultsViewModel());
            this.profileResults(new Array());
        }

        //***********************
        // Provider view methods
        //***********************
        selectProviderHandler(providerModel: PublishedProviderResultViewModel): void {
            this.pageState('providerView');
            this.providerViewSelectedTab(ProviderViewSelectedTab.ProviderInfo);
            this.selectedProviderView(providerModel);
        }

        public PopulateSpecification(fundingModel: ViewFundingViewModel): void {
            if (fundingModel.selectedFundingPeriod() !== undefined && fundingModel.selectedFundingPeriod().value !== "Select" && fundingModel.selectedFundingStream() !== undefined && fundingModel.selectedFundingStream().name !== "Select") {
                /** Load Specifications in the specification dropdown */
                let getSpecificationForSelectedPeriodUrl = fundingModel.settings.specificationsFilteredUrl.replace("{fundingPeriodId}", fundingModel.selectedFundingPeriod().id).replace("{fundingStreamId}", fundingModel.selectedFundingStream().id);
                let specificationRequest = $.ajax({
                    url: getSpecificationForSelectedPeriodUrl,
                    dataType: "json",
                    method: "get",
                    contentType: "application/json",
                })
                    .done(function (response) {
                        let newSpecificationArray = Array<SpecificationResponse>();
                        ko.utils.arrayForEach(response, function (item: any) {
                            let specResponse = new SpecificationResponse(item.id, item.name, item.fundingPeriod, item.publishedResultsRefreshedAt, item.fundingStreams);
                            newSpecificationArray.push(specResponse);
                        });
                        fundingModel.selectedSpecification(newSpecificationArray[0]);
                    })
                    .fail((response) => {
                        fundingModel.notificationMessage("There was a problem retreiving the Specifications, please try again.");
                        fundingModel.notificationStatus("error");
                    });
            }
            else {
                fundingModel.selectedSpecification();
            }
        }

        public LoadProfileResult(providerId: string, specificationId: string, fundingStreamId: string): void {
            let results = this.profileResults().filter(p => p.providerId == providerId && p.specificationId == specificationId && p.fundingStreamId == fundingStreamId);

            if (results.length > 0) {
                this.profileResult(results[0]);
            }
            else {
                let self = this;

                $.ajax({
                    url: "/api/results/published-provider-profile/providerId/" + providerId + "/specificationId/" + specificationId + "/fundingStreamId/" + fundingStreamId,
                    type: "GET",
                    success: function (data) {
                        let result = new ProfileResultsViewModel();
                        result.providerId = providerId;
                        result.specificationId = specificationId;
                        result.fundingStreamId = fundingStreamId;
                        result.ProfileResults = new Array();

                        data.forEach(function (item: calculateFunding.common.IProfileResult) {
                            let pr = new ProfileResultViewModel();
                            pr.name = item.name;

                            pr.profilePeriods = new Array();
                            item.profilePeriods.forEach(function (pd: calculateFunding.common.IProfilePeriods) {
                                let vm = new ProfilePeriodsViewModel();
                                vm.period = pd.period;
                                vm.occurrence = pd.occurrence;
                                vm.periodYear = pd.periodYear;
                                vm.periodType = pd.periodType;
                                vm.profileValue = pd.profileValue;
                                vm.distributionPeriod = pd.distributionPeriod;
                                pr.profilePeriods.push(vm);
                            });

                            pr.financialEnvelopes = new Array();
                            item.financialEnvelopes.forEach(function (fe: calculateFunding.common.IFinancialEnvelopes) {
                                let vm = new FinancialEnvelopesViewModel();
                                vm.monthStart = fe.monthStart;
                                vm.yearStart = fe.yearStart;
                                vm.monthEnd = fe.monthEnd;
                                vm.yearEnd = fe.yearEnd;
                                vm.value = fe.value;
                                pr.financialEnvelopes.push(vm);
                            });

                            result.ProfileResults.push(pr);
                        });

                        self.profileResults.push(result);
                        self.profileResult(result);

                        return true;
                    }
                });
            }
        }

        //***********************
        // Notifications methods
        //***********************
        currentJobType: KnockoutObservable<string> = ko.observable("");
        isJobRunning: KnockoutObservable<boolean> = ko.observable(false);
        jobSuccessMessage: string;
        jobFailureMessage: string;

        protected onConnected(): void {
            // Doesn't immediately subscribe to any groups, has to wait until user has chosen the specification details to view the funding details for
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

        protected onJobCompleted(status: calculateFunding.notifications.CompletionStatus, jobType: string): void {
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

        public filteredResults: KnockoutComputed<Array<PublishedProviderResultViewModel>> = ko.pureComputed(function () {
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

        public filteredResultsSelectedAllocationTotal: KnockoutComputed<number> = ko.pureComputed(() => {
            let total: number = 0;
            let providers: Array<PublishedProviderResultViewModel> = this.filteredResults()
            for (let i in providers) {
                let provider: PublishedProviderResultViewModel = providers[i];
                let providerFilteredAllocationLines = provider.allocationLineResultsFiltered();
                for (let k in providerFilteredAllocationLines) {
                    let allocationLine: PublishedAllocationLineResultViewModel = providerFilteredAllocationLines[k];
                    total = total + allocationLine.fundingAmount;
                }
            }

            return total;
        });

        public filteredResultsSelectedAllocationTotalDisplay: KnockoutComputed<string> = ko.pureComputed(() => {
            return this.filteredResultsSelectedAllocationTotal().toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
        });

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

        providerViewSelectTab(selectedTab: string): string {
            return this.providerViewSelectedTab() == (<any>ProviderViewSelectedTab)[selectedTab]
                ? "nav-item active"
                : "nav-item";
        }

        providerViewClickTab(selectedTab: string, viewModel: ViewFundingViewModel): void {
            viewModel.providerViewSelectedTab((<any>ProviderViewSelectedTab)[selectedTab]);

            if (viewModel.providerViewSelectedTab() == ProviderViewSelectedTab.ProfileResults) {
                let providerId = viewModel.selectedProviderView().providerId;
                let specificationId = viewModel.selectedSpecification().id;
                let fundingStreamId = viewModel.selectedFundingStream().id;

                viewModel.LoadProfileResult(providerId, specificationId, fundingStreamId);
            }
        }

        providerViewTab(selectedTab: string): string {
            switch (selectedTab) {
                case "ProviderInfo":
                    return "Provider info";

                case "AllocationLine":
                    return "Allocation line";

                case "PublicCalculations":
                    return "Public calculations";

                case "ProfileResults":
                    return "Profile results";
            }
        }

        providerViewSelectedTabName: KnockoutComputed<string> = ko.pureComputed(() => {
            return ProviderViewSelectedTab[this.providerViewSelectedTab()];
        });


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

            // if checkAll checkbox is selected, then the action to apply all to KO will happen here.

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
        performSnapshotRefresh() {
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

        /**
         * Request that the funding snapshot is refreshed
         * As the process is asynchronous is sets up a poll mechanism to check on the progress
         * */
        refreshFundingSnapshot() {
            this.performSnapshotRefresh();
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

                        let status = new SpecificationExecutionStatus(response.specificationId, response.percentageCompleted, response.calculationProgress, response.errorMessage, response.publishedResultsRefreshedAt, response.newCount, response.approvedCount, response.publishedCount, response.updatedCount);

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
                                this.updatedCount(response.updatedCount + response.newCount);
                            }
                            this.workingPercentComplete(null);
                            this.isWorkingVisible(false);

                            this.loadProviderResults();

                            if (status.publishedResultsRefreshedAt) {
                                // If the refresh resulted in changes then the refreshed date will change, otherwise it won't
                                this.selectedSpecification().publishedResultsRefreshedAt(status.publishedResultsRefreshedAt);
                            }
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

            // Start watching for job notifications for the selected specification
            this.startWatchingForSpecificationNotifications(this.selectedSpecification().id);

            this.retrieveLatestJobStatus();
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
                        self.permissions(new SpecificationPermissions(response.canRefreshFunding, response.canApproveFunding, response.canReleaseFunding));
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
                    newProvider.totalFundingAmount = receivedProvider.fundingAmount;

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
        public loadFundingStreams() {
            let self = this;

            let specificationRequest = $.ajax({
                url: this.settings.specificationsUrl,
                dataType: "json",
                method: "get",
                contentType: "application/json",
            })
                .done(function (response) {
                    let newSpecificationArray: Array<SpecificationResponse> = Array<SpecificationResponse>();
                    let newStreamArray: Array<FundingStreamResponse> = Array<FundingStreamResponse>();
                    self.fundingPeriodStreams = Array<FundingPeriodStreams>();
                    ko.utils.arrayForEach(response, function (item: SpecificationResponse) {
                        newSpecificationArray.push(item);
                        self.fundingPeriodStreams.push(new FundingPeriodStreams(item.fundingPeriod, item.fundingStreams));

                        newStreamArray = newStreamArray.concat(item.fundingStreams.filter((stream:FundingStreamResponse) => newStreamArray.filter((current) => current.id == stream.id).length === 0));
                    });

                    self.FundingStreams(newStreamArray);

                    // If the query string contains a funding stream then try and pre-select it
                    let givenStream: string = self.getQueryStringValue("fundingStreamId");
                    if (givenStream) {
                        let foundItem = ko.utils.arrayFirst(newStreamArray, function (item) {
                            return item.id == givenStream;
                        });

                        if (foundItem) {
                            self.selectedFundingStream(foundItem);
                        }
                    }
                })

                .fail((response) => {
                self.notificationMessage("There was a problem retreiving the funding streams, please try again");
                self.notificationStatus("error");
            })
        }

        private getQueryStringValue(key: string) {
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
        newCount: number;
        approvedCount: number;
        publishedCount: number;
        updatedCount: number;
        hasChanges: boolean;

        constructor(specificationId: string, percentageCompleted: number, calculationProgressStatus: CalculationProgressStatus, errorMessage: string, publishedResultsRefreshedAt: Date, newCount: number, approvedCount: number, publishedCount: number, updatedCount: number) {
            this.specificationId = specificationId;
            this.percentageCompleted = percentageCompleted;
            this.calculationProgressStatus = calculationProgressStatus;
            this.errorMessage = errorMessage;
            this.publishedResultsRefreshedAt = publishedResultsRefreshedAt;
            this.newCount = newCount;
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

    enum ProviderViewSelectedTab {
        ProviderInfo,
        AllocationLine,
        PublicCalculations,
        ProfileResults
    }

    /** A published provider result */
    export class PublishedProviderResultViewModel {
        providerName: string;
        providerId: string;
        providerType: string;
        ukprn: string;
        authority: string;
        totalFundingAmount: number;
        fundingAmount: KnockoutComputed<number>;
        get fundingAmountDisplay(): string {
            return PublishedProviderResultViewModel.getNumberFigureInTextFormat(this.fundingAmount());
        }
        get totalFundingAmountDisplay(): string {
            return PublishedProviderResultViewModel.getNumberFigureInTextFormat(this.totalFundingAmount);
        }
        totalAllocationLines: KnockoutComputed<Number>;
        numberNew: KnockoutComputed<number>;
        numberApproved: KnockoutComputed<number>
        numberUpdated: KnockoutComputed<number>;
        numberPublished: KnockoutComputed<number>;
        testCoveragePercent: number;
        testsPassed: number;
        testsTotal: number;

        public generateExpand: KnockoutObservable<boolean> = ko.observable(false);

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

        private static getTotalForStatus(allocationLineResultsFiltered: PublishedAllocationLineResultViewModel[], status: AllocationLineStatus) {
            return allocationLineResultsFiltered.filter(function (al) {
                return al.status === status;
            }).length
        }

        private static getNumberFigureInTextFormat(numberToFormat: number) {
            return (Number(numberToFormat)).toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
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
        get statusDisplay(): string {
            return (<any>AllocationLineStatus)[this.status];
        }
        get statusDisplayClass(): string {
            return "status-" + (<any>AllocationLineStatus)[this.status].toLowerCase()
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
        providerType: string;
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
        specificationsFilteredUrl: string;
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

    interface ITemplateData {
        jobInvokerDisplayName: string;
        jobCreatedAt: string,
        modalTitle: string
    }

    function FormatCurrency(amount: number): string {
        return (Number(amount)).toLocaleString('en-GB', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
    }

    /** A summary of the data to be approved or published */
    class ConfirmPublishApproveViewModel {
        numberOfProviders: number;
        providerTypes: calculateFunding.controls.ExpanderViewModel = new calculateFunding.controls.ExpanderViewModel([]);
        localAuthorities: calculateFunding.controls.ExpanderViewModel = new calculateFunding.controls.ExpanderViewModel([]);
        allocationLines: Array<AllocationLineSummaryViewModel> = [];
        totalFundingApproved: number = 0;
        get totalFundingApprovedDisplay(): string {
            return "£" + FormatCurrency(this.totalFundingApproved);
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
            return "£" + FormatCurrency(this.value);
        }
    }

    /** Details for rollup of a set of allocation lines */
    class AllocationLineRollupViewModel {
        name: string;
        value: number;

        get valueDisplay(): string {
            return "£" + FormatCurrency(this.value);
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

    class ProfileResultViewModel {
        name: string;
        profilePeriods: ProfilePeriodsViewModel[];
        financialEnvelopes: FinancialEnvelopesViewModel[];

        profilePeriodValues : KnockoutComputed<string> = ko.pureComputed(()=>
            "£" + FormatCurrency(this.profilePeriods
                .map(q => q.profileValue)
                .reduce((add, a) => add + a, 0))
        );
    }

    class ProfilePeriodsViewModel {
        period: string;
        occurrence: string;
        periodYear: number;
        periodType: string;
        profileValue: number;
        distributionPeriod: string;

        get periodDisplay(): string {
            return this.period + " " + this.periodYear;
        }

        get profileValueDisplay(): string {
            return "£" + FormatCurrency(this.profileValue);
        }
    }

    class FinancialEnvelopesViewModel {
        monthStart: string;
        yearStart: string;
        monthEnd: string;
        yearEnd: string;
        value: number;

        get valueDisplay(): string {
            return "£" + FormatCurrency(this.value);
        }
    }

    class ProfileResultsViewModel {
        providerId: string;
        specificationId: string;
        fundingStreamId: string;
        ProfileResults: ProfileResultViewModel[];

        get profiles(): string[] {
            return this.ProfileResults
                .map(p => p.name)
                .filter((p, i, a) => a.indexOf(p) == i);
        }

        profilePeriodValues(profile: string): number {
            return this.ProfileResults
                .filter(p => p.name == profile)
                .map(p => p.profilePeriods)
                .reduce((p, q) => [...p, ...q], [])
                .map(q => q.profileValue)
                .reduce((add, a) => add + a, 0);
        }
    }

    /** Funding period dropdown options */
    export class FundingPeriodResponse {
        constructor(id: string, value: string, name: string, period: string) {
            this.id = id;
            this.value = value;
            this.name = name;
            this.period = period;
        }
        id: string;
        value: string;
        name: string;
        period: string;
    }

    /** Specification dropdown options  */
    export class SpecificationResponse {
        constructor(id: string, name: string, fundingPeriod: FundingPeriodResponse, publishedResultsRefreshedAt: Date, fundingStreams: Array<FundingStreamResponse>) {
            this.id = id;
            this.name = name;
            this.fundingPeriod = fundingPeriod;
            this.publishedResultsRefreshedAt(publishedResultsRefreshedAt);
            this.fundingStreams = fundingStreams;
        }
        id: string;
        name: string;
        fundingPeriod: FundingPeriodResponse;
        fundingStreams: Array<FundingStreamResponse>;
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

    export class FundingPeriodStreams {
        constructor(fundingPeriod: FundingPeriodResponse, fundingStreams: Array<FundingStreamResponse>) {
            this.fundingPeriod = fundingPeriod;
            this.fundingStreams = fundingStreams;
        }

        fundingPeriod: FundingPeriodResponse;
        fundingStreams: Array<FundingStreamResponse>;
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