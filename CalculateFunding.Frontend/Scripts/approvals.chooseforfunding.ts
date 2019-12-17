namespace calculateFunding.approvals {

    export class ChooseFundingViewModel {
        private readonly instructCalculationsJobDefinitionId: string = "CreateInstructAllocationJob";

        private readonly instructAggregationsCalculationsJobDefinitionId: string = "CreateInstructGenerateAggregationsAllocationJob";

        public messageTemplateData: ITemplateData = { jobInvokerDisplayName: "", jobCreatedAt: "", modalTitle: "Unable to choose specification" };

        public modalVisible: KnockoutObservable<boolean> = ko.observable(false);

        public bodyTemplate: KnockoutObservable<string> = ko.observable("blankTemplate");

        public bodyData: KnockoutComputed<any>;

        public modalSize: KnockoutObservable<string> = ko.observable('funding-modal');

        private settings: IChooseFundingSettings;
        public fundingPeriods: KnockoutObservableArray<FundingPeriodResponse> = ko.observableArray();
        public fundingStreams: KnockoutObservableArray<FundingStreamResponse> = ko.observableArray();
        public selectedFundingPeriod: KnockoutObservable<FundingPeriodResponse> = ko.observable();
        public selectedFundingStreams: KnockoutObservableArray<string> = ko.observableArray([]);
        public specifications: KnockoutObservableArray<SpecificationChooseForFunding> = ko.observableArray([]);
        public notificationMessage: KnockoutObservable<string> = ko.observable(null);
        public notificationStatus: KnockoutObservable<string> = ko.observable();
        public showSecurityBanner: KnockoutObservable<boolean> = ko.observable(false);
        public isSpecificationSelectedForThisFunding: KnockoutObservable<boolean> = ko.observable(false);
        public pageBannerOperation: KnockoutObservable<PageBannerOperation> = ko.observable();

        constructor(settings: IChooseFundingSettings) {
            if (typeof settings !== "undefined" && settings === null) {
                throw "Settings must be provided to the choose funding view model";
            }
            else if (typeof settings.antiforgeryToken !== "undefined" && !settings.antiforgeryToken) {
                throw "Settings must contain the antiforgeryToken";
            }
            else if (typeof settings.fundingPeriodUrl !== "undefined" && !settings.fundingPeriodUrl) {
                throw "Settings must contain the funding period query url";
            }
            else if (typeof settings.fundingStreamsUrl !== "undefined" && !settings.fundingStreamsUrl) {
                throw "Settings must contain the fuding streams query url";
            }
            
            let self = this;
            self.settings = settings;

            self.selectedFundingPeriod.subscribe(function () {
                self.PopulateSpecifications(self);
            });

            self.selectedFundingStreams.subscribe(function () {
                self.PopulateSpecifications(self);
            });

            self.bodyData = ko.computed(function () {
                return self.messageTemplateData;
            });

            /** Request to get the funding streams */
            this.loadFundingStreams();

            /** Request to get the funding periods */
            this.loadFundingPeriods();
        }

        public loadFundingStreams() {
            let self = this;

            let fundingRequest = $.ajax({
                url: this.settings.fundingStreamsUrl,
                dataType: "json",
                method: "get",
                contentType: "application/json",
            })
                .done(function (response) {
                    let fundingStreams: Array<FundingStreamResponse> = response;
                    self.fundingStreams(fundingStreams);
                    let specificationSelected: string = self.getQueryStringValue("specificationId");
                    if (specificationSelected != undefined && specificationSelected !== "") {
                        let specificationRequest = $.ajax({
                            url: self.settings.specificationsUrl.replace("{specificationId}", specificationSelected),
                            dataType: "json",
                            method: "get",
                            contentType: "application/json",
                        })
                        .done(function (response) {
                            let specification: SpecificationResponse = response;
                            ko.utils.arrayForEach(specification.fundingStreams, function (fundingStream) {
                                self.selectedFundingStreams.push(fundingStream.id);
                            });
                        })
                        .fail((response) => {
                            self.notificationMessage("There was a problem retreiving the funding streams for selected specification, please try again");
                            self.notificationStatus("error");
                        });
                    }
                })

                .fail((response) => {
                    self.notificationMessage("There was a problem retreiving the funding streams, please try again");
                    self.notificationStatus("error");
                })
        }

        public PopulateSpecifications(fundingModel: ChooseFundingViewModel): void {
            fundingModel.specifications([]);
            fundingModel.isSpecificationSelectedForThisFunding(false);
            fundingModel.showSecurityBanner(false);
            fundingModel.pageBannerOperation(null);
            if (fundingModel.selectedFundingPeriod() !== undefined && fundingModel.selectedFundingPeriod().value !== "Select" && fundingModel.selectedFundingStreams() !== undefined) {
            /** Load Specifications in the specification dropdown */
                ko.utils.arrayForEach(fundingModel.selectedFundingStreams(), function (item: any) {
                    let getSpecificationForSelectedPeriodUrl = fundingModel.settings.specificationsFilteredUrl.replace("{fundingPeriodId}", fundingModel.selectedFundingPeriod().id).replace("{fundingStreamId}", item);
                    let specificationRequest = $.ajax({
                        url: getSpecificationForSelectedPeriodUrl,
                        dataType: "json",
                        method: "get",
                        contentType: "application/json",
                    })
                        .done(function (response) {
                            let specificationIds: Array<string> = new Array<string>();
                            ko.utils.arrayForEach(response, function (item: any) {
                                let found: boolean = true;
                                let specResponse = new SpecificationChooseForFunding(item.item1.id, item.item1.name, item.item1.fundingPeriod, item.item1.publishedResultsRefreshedAt, item.item1.fundingStreams, item.item1.approvalStatus, item.item1.isSelectedForFunding, item.item2);
                                if (!specResponse.canBeChosen()) {
                                    fundingModel.showSecurityBanner(true);
                                }
                                ko.utils.arrayForEach(fundingModel.selectedFundingStreams(), function (selectStream: string) {
                                    let foundStream: FundingStreamResponse = ko.utils.arrayFirst(item.item1.fundingStreams, function (fundingStream: FundingStreamResponse) {
                                        return fundingStream.id == selectStream;
                                    });

                                    if (foundStream == undefined) {
                                        found = false;
                                    }
                                });
                                if (found == true) {
                                    fundingModel.specifications.push(specResponse);
                                    if (specResponse.isSelectedForFunding()) {
                                        fundingModel.isSpecificationSelectedForThisFunding(true);
                                        fundingModel.pageBannerOperation(new PageBannerOperation(specResponse.name,
                                            "Specification",
                                            "chosen for funding",
                                            specResponse.id,
                                            "View funding",
                                            "/approvals/viewfunding?specificationId=" + specResponse.id + "&fundingPeriodId=" + fundingModel.selectedFundingPeriod().id));
                                    }
                                    specificationIds.push(specResponse.id);
                                }
                            });

                            if (specificationIds.length === 0) {
                                return;
                            }

                            let calcStatusRequest = $.ajax({
                                url: fundingModel.settings.calculationStatusCountUrl,
                                dataType: "json",
                                method: "post",
                                data: JSON.stringify(new SpecificationIdsRequestModel(specificationIds)),
                                contentType: "application/json",
                            })
                            .done(function (response) {
                                ko.utils.arrayForEach(response, function (item: CalculationStatusCounts) {
                                    let specification: SpecificationChooseForFunding = ko.utils.arrayFirst(fundingModel.specifications(), function (specification) {
                                        return specification.id == item.specificationId;
                                    });

                                    specification.CalculationsApproved(item.approved);
                                    specification.CalculationsTotal(item.total);
                                })
                            })
                            .fail((response) => {
                                fundingModel.notificationMessage("There was a problem retreiving the Specifications, please try again.");
                                fundingModel.notificationStatus("error");
                            })

                            let testStatusRequest = $.ajax({
                                url: fundingModel.settings.testScenarioQueryUrl,
                                dataType: "json",
                                method: "post",
                                data: JSON.stringify(new SpecificationIdsRequestModel(specificationIds)),
                                contentType: "application/json",
                            })
                                .done(function (response) {
                                    ko.utils.arrayForEach(response, function (item: SpecificationTestScenarioResultCounts) {
                                        let specification: SpecificationChooseForFunding = ko.utils.arrayFirst(fundingModel.specifications(), function (specification) {
                                            return specification.id == item.specificationId;
                                        });

                                        specification.QaTestsPassed(item.passed);
                                        specification.QaTestsTotal(item.passed + item.ignored + item.failed);
                                        specification.providerQaCoverage(item.testCoverage);
                                    })
                                })
                                .fail((response) => {
                                    fundingModel.notificationMessage("There was a problem retreiving the Specifications, please try again.");
                                    fundingModel.notificationStatus("error");
                                })
                        })
                        .fail((response) => {
                            fundingModel.notificationMessage("There was a problem retreiving the Specifications, please try again.");
                            fundingModel.notificationStatus("error");
                        });
                });
            }
        }

        public loadFundingPeriods() {
            let self = this;

            let fundingRequest = $.ajax({
                url: this.settings.fundingPeriodUrl,
                dataType: "json",
                method: "get",
                contentType: "application/json",
            })
                .done(function (response) {
                    let fundingPeriods: Array<FundingPeriodResponse> = response;
                    self.fundingPeriods(fundingPeriods);
                    let fundingPeriodSelected: string = self.getQueryStringValue("fundingPeriod");
                    if (fundingPeriodSelected != undefined) {
                        self.selectedFundingPeriod(ko.utils.arrayFirst(fundingPeriods, function (fundingPeriod) {
                            return fundingPeriod.id == fundingPeriodSelected;
                        }));
                    }
                })

                .fail((response) => {
                    self.notificationMessage("There was a problem retreiving the funding periods, please try again");
                    self.notificationStatus("error");
                })
        }

        public checkLastJobStatus(specificationId: string, chooseUrl: string) {

            if (!specificationId) {
                throw "A specification id must be provided";
            }

            let self = this;

            let url = "/api/jobs/" + specificationId + "/latest/" + self.instructCalculationsJobDefinitionId + "," + self.instructAggregationsCalculationsJobDefinitionId;

            $.ajax({
                url: url,
                dataType: "json",
                method: "GET"
            })
                .done((result) => {
                    console.log("successfully submitted request to check lastest job");

                    self.messageTemplateData.jobInvokerDisplayName = result.invokerUserDisplayName;
                    self.messageTemplateData.jobCreatedAt = result.createdFormatted;

                    if (result.runningStatus !== "Completed") {
                        self.bodyTemplate("jobStillRunningMessageTemplate");
                        self.modalVisible(true);
                    }
                    else if (result.completionStatus === "Failed") {
                        self.bodyTemplate("jobFailedMessageTemplate");
                        self.modalVisible(true);
                    }
                    else {
                        window.location.href = chooseUrl;
                    }

                })
                .fail((ex) => {
                    console.log("error submitting request to check lastest job: " + ex);

                    return false;

                });
        }

        private getQueryStringValue(key: string) {
            return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }
    }

    interface ITemplateData {
        jobInvokerDisplayName: string;
        jobCreatedAt: string,
        modalTitle: string
    }

    /** The settings */
    interface IChooseFundingSettings {
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
        calculationStatusCountUrl: string;
    }

}