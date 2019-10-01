/// <reference path="../node_modules/@aspnet/signalr/dist/esm/index.d.ts" />

namespace calculateFunding.specification {
    export class CreateSpecificationViewModel {
        public selectedFundingStream: KnockoutObservable<string> = ko.observable();
        public providerVersions: KnockoutObservableArray<IProviderVersion> = ko.observableArray([]);
        public fundingPeriods: KnockoutObservableArray<IFundingPeriod> = ko.observableArray([]);
        public fundingStreams: KnockoutObservableArray<IFundingStream> = ko.observableArray([]);
        public selectedProviderVersion: KnockoutObservable<string> = ko.observable();
        public isInProgress: KnockoutObservable<boolean> = ko.observable();
        public errorMessage: KnockoutObservable<string> = ko.observable();
        public name: KnockoutObservable<string> = ko.observable();
        public fundingStreamId: KnockoutObservable<string> = ko.observable();
        public providerVersionId: KnockoutObservable<string> = ko.observable();
        public description: KnockoutObservable<string> = ko.observable();
        public fundingPeriodId: KnockoutObservable<string> = ko.observable();
        public specificationId: KnockoutObservable<string> = ko.observable();

        public nameValid: KnockoutObservable<boolean> = ko.observable(true);
        public fundingStreamIdValid: KnockoutObservable<boolean> = ko.observable();
        public providerVersionIdValid: KnockoutObservable<boolean> = ko.observable();
        public fundingPeriodIdValid: KnockoutObservable<boolean> = ko.observable();
        public descriptionValid: KnockoutObservable<boolean> = ko.observable();
        public formValid: KnockoutObservable<boolean> = ko.observable();
        public formError: KnockoutObservable<boolean> = ko.observable();

        public showCreatingSpec: KnockoutObservable<boolean> = ko.observable(false);
        public showCreatingCalcs: KnockoutObservable<boolean> = ko.observable(false);


        private _hubConnection: signalR.HubConnection;
        private connectionRetries: number = 0;

        connectionError: KnockoutObservable<boolean> = ko.observable(false);

        currentStatus: KnockoutObservable<JobStatus> = ko.observable(new JobStatus());

        constructor() {
            let self = this;
            
            this.init();
        }

        private init(): void {
            let self = this;

            this._hubConnection = new signalR.HubConnectionBuilder()
                .withUrl("/notifications")
                .build();

            this._hubConnection.onclose((error) => {
                self.onConnectionError(error, self);
            });

            this._hubConnection.on("NotificationEvent", (message) => {
                console.log("received notification");
                self.receivedNotification(self, message);
            });

            this._hubConnection.on("JoinGroup", (data: string) => {
                console.log("joined group - " + data);
            });

            this._hubConnection.on("LeaveGroup", (data: string) => {
                console.log(`left group - ${data}`);
            });

            console.log("Starting Hub");
            this._hubConnection.start()
                .then(() => {
                    this.onConnectedToSignalr(this._hubConnection);
                    this.connectionRetries = 0;
                    this.connectionError(false);
                })
                .catch(error => {
                    console.error(error.message);

                    if (this.connectionRetries < 3) {
                        this.connectionRetries++;
                        setTimeout(this.init, 1000 * (this.connectionRetries));
                    }
                    else {
                        this.connectionError(true);
                    }
                });

            self.selectedFundingStream.subscribe((newValue: any) => {
                console.log(newValue);
                this.fundingStreamChanged(newValue);
            });

            this.fundingStreamChanged(this.selectedFundingStream());
        }

        startWatchingForAllNotifications(): void {
            if (this._hubConnection) {
                this._hubConnection.invoke("StartWatchingForAllNotifications");
            }
        }

        stopWatchingForAllNotifications(): void {
            if (this._hubConnection) {
                this._hubConnection.invoke("StopWatchingForAllNotifications");
            }
        }

        startWatchingForSpecificationNotifications(specificationId: string): void {
            if (this._hubConnection) {
                this._hubConnection.invoke("StartWatchingForSpecificationNotifications", specificationId);
            }
        }

        stopWatchingForSpecificationNotifications(specificationId: string): void {
            if (this._hubConnection) {
                this._hubConnection.invoke("StopWatchingForSpecificationNotifications", specificationId);
            }
        }

        private receivedNotification(viewModel: CreateSpecificationViewModel, notification: JobNotification): void {
            let status = viewModel.currentStatus();

            console.log("received job notification for job id '" + notification.jobId + "' and type '" + notification.jobType + "'", notification);

            if (!status) {
                status = new JobStatus();
            }

            if (status.jobId !== notification.jobId && !notification.parentJobId && notification.runningStatus !== RunningStatus.Completed) {
                console.log("changing job created date as different job id received");

                status.jobCreatedTime(notification.statusDateTime);

                this.onJobStarted(notification.jobType);
            }

            status.jobId = notification.jobId;
            status.completedSuccessfully = notification.completionStatus === CompletionStatus.Succeeded;
            status.invoker = notification.invokerUserDisplayName;
            status.itemCount = notification.itemCount;
            status.outcome = notification.outcome;
            status.overallItemsFailed = notification.overallItemsFailed;
            status.overallItemsProcessed = notification.overallItemsProcessed;
            status.overallitemsSucceeded = notification.overallitemsSucceeded;
            status.running = notification.runningStatus !== RunningStatus.Completed;
            status.statusDateTime(notification.statusDateTime);

            viewModel.currentStatus(status);

            if (status.completedSuccessfully) {
                this.onJobCompleted(CompletionStatus.Succeeded, notification.jobType);
            }

            if (!notification.parentJobId && notification.runningStatus === RunningStatus.Completed) {
                this.isInProgress(false);
            }
        }

        private onConnectedToSignalr(connection: signalR.HubConnection) {
            console.log("signalr connection started");

            this.onConnected();
        }

        private onConnectionError(error: Error, vm: CreateSpecificationViewModel) {
            console.log("signalr error");

            if (error && error.message) {
                console.error(error.message);
                setTimeout(vm.init, 3000);
            }
        }

        protected onConnected(): void {
            console.log("signalr connected");
        }

        protected onJobStarted(jobType: string): void {
            this.isInProgress(true);
        }

        protected onJobCompleted(status: CompletionStatus, jobType: string): void {
            console.log("received completed notification - updating search results");
            window.location.replace(`/specs/fundinglinestructure/${this.specificationId()}`);
        }


        public fundingStreamChanged(providerVersionId:string): void {

            if (providerVersionId == undefined || providerVersionId == null || providerVersionId.length <= 0) {
                //only request provider versions if a funding stream has been selected
                console.log("Backing out of provider version search request as no funding stream selected");
                return;
            }

            let request = $.ajax({
                data: JSON.stringify(providerVersionId),
                url: "/api/providerversions/getbyfundingstream",
                dataType: "json",
                method: "POST",
                contentType: "application/json"
            });

            console.log("Starting search request");

            request.done((resultUntyped) => {
                console.log("Search request completed");
                let results: Array<IProviderVersion> = resultUntyped;
                this.providerVersions(ko.utils.arrayMap(results, item => {
                    item.display = providerVersionId + " from " + new Date(item.targetDate).toLocaleDateString() + " Version " + Number(item.version);
                    item.description = item.description;
                    return item;
                }));
                $("#select-funding-period > option").remove();

                this.populateFundingPeriods(providerVersionId);
               this.selectedProviderVersion(providerVersionId);
            });

            request.fail((xhrDetails: JQuery.jqXHR<any>, errorStatus: JQuery.Ajax.ErrorTextStatus) => {
                console.log("Search request failed");
                this.isInProgress(false);
            });

           
        }

        public populateFundingPeriods(selectedFundingStreamId: string) {
            let request = $.ajax({
                url: `/api/policy/fundingperiods/${selectedFundingStreamId}`,
                dataType: "json",
                method: "GET"
            });

            console.log("Starting request for funding period ids");

            request.done((resultUntyped) => {
                console.log("Request completed");
                let results: Array<IFundingPeriod> = resultUntyped;
                this.fundingPeriods(ko.utils.arrayMap(results, function (item) {
                    return item;
                }));
            });

            request.fail((xhrDetails: JQuery.jqXHR<any>, errorStatus: JQuery.Ajax.ErrorTextStatus) => {
                console.log("Search request failed");
                this.isInProgress(false);
            });
        }

        public getFundingStream(): void {
            let request = $.ajax({
                url: "/api/policy/fundingstreams",
                dataType: "json",
                method: "GET",
                contentType: "application/json"
            });

            request.done((resultUntyped) => {
                console.log("received funding periods");
                let results: Array<IFundingPeriod> = resultUntyped;
                this.fundingStreams(ko.utils.arrayMap(results, item => {
                    return item;
                }));
            });

            request.fail((xhrDetails: JQuery.jqXHR<any>, errorStatus: JQuery.Ajax.ErrorTextStatus) => {

                console.log("funding periods request failed");
                this.isInProgress(false);
            });
        }

        public createSpecification(): void {
            console.log("Creating specification");

            var isValidSubmission = this.checkValidSubmission();

            if (isValidSubmission) {
                this.isInProgress(true);
                this.showCreatingSpec(true);
                let csData = new CreateSpecificationModel();
                csData.name = this.name();
                csData.fundingStreamId = $("#select-funding-stream option:selected").val().toString();
                csData.providerVersionId = $("#providerVersionIdSelect option:selected").val().toString();
                csData.description = this.description();
                csData.fundingPeriodId = $("#select-funding-period option:selected").val().toString();

                let request = $.ajax({
                    data: JSON.stringify(csData),
                    url: "/api/specs/create",
                    dataType: "json",
                    method: "POST",
                    contentType: "application/json"
                });

                request.fail((xhrDetails: JQuery.jqXHR<any>, errorStatus: JQuery.Ajax.ErrorTextStatus) => {
                    if (xhrDetails.responseJSON != null) {
                        let message: string = "";
                        $.each(Object.keys(xhrDetails.responseJSON), function (i, fieldItem) {
                            message += xhrDetails.responseJSON[fieldItem];
                        })
                        message += "\n";
                        this.errorMessage(message);
                    }
                    this.isInProgress(false);
                    this.formError(true);
                });

                request.done((data) => {
                    let result: ISpecificationResult = data;
                    this.specificationId(result.id);

                    console.log(this.specificationId());

                    this.showCreatingSpec(false);
                    this.showCreatingCalcs(true);

                    this.startWatchingForSpecificationNotifications(this.specificationId());
                    console.log("Watching for specId: " + this.specificationId());
                });
            }
            else {
                this.scrollWindowTop();
            }
        }

        public scrollWindowTop() {
            $(window).scrollTop(0);
        }

        public checkValidSubmission() {
            this.formValid(true);
            this.formError(false);

            if (this.name() == null || this.name().length == 0) {
                this.nameValid(false);
                this.formValid(false);

            } else {
                this.nameValid(true);
            }

            if ($("#select-funding-stream option:selected").val() == null) {
                this.fundingStreamIdValid(false);
                this.formValid(false);
            } else {
                this.fundingStreamIdValid(true);
            }

            if ($("#providerVersionIdSelect option:selected").val() == null) {
                this.providerVersionIdValid(false);
                this.formValid(false);
            } else {
                this.providerVersionIdValid(true);
            }

            if ($("#select-funding-period option:selected").val() == null) {
                this.fundingPeriodIdValid(false);
                this.formValid(false);
            } else {
                this.fundingPeriodIdValid(true);
            }

            if (this.description() == null || this.description().length == 0) {
                this.descriptionValid(false);
                this.formValid(false);
            } else {
                this.descriptionValid(true);
            }

            return this.formValid();

        }


    }

    export interface IFundingPeriod {
        id: string,
        name: string,
        startDate: Date,
        endDate: Date,
        startYear: number,
        endYear: number,
    }

    export interface IFundingStream {
        id: string,
        name: string,
    }
    export interface ISpecificationResult {
        id: string,
        name: string,
    }

    export class CreateSpecificationModel {
        name: string;
        fundingStreamId: string;
        providerVersionId: string;
        description: string;
        fundingPeriodId: string;
    }

    export class JobNotification {
        jobId: string;
        jobType: string;
        runningStatus: RunningStatus;
        completionStatus: CompletionStatus;
        specificationId: string;
        invokerUserId: string;
        invokerUserDisplayName: string;
        itemCount: number;
        overallItemsProcessed: number;
        overallitemsSucceeded: number;
        overallItemsFailed: number;
        trigger: Trigger;
        parentJobId: string;
        supersededByJobId: string;
        statusDateTime: Date;
        outcome: string;
    }

    enum RunningStatus {
        Queued = "Queued",
        QueuedWithService = "QueuedWithService",
        InProgress = "InProgress",
        Completed = "Completed"
    }

    export enum CompletionStatus {
        Succeeded = "Succeeded",
        Failed = "Failed",
        Cancelled = "Cancelled",
        TimedOut = "TimedOut",
        Superseded = "Superseded"
    }

    class Trigger {
        message: string;
        entityId: string;
        entityType: string;
    }

    export class JobStatus {
        jobId: string;
        jobType: string;
        running: boolean;
        completedSuccessfully: boolean;
        invoker: string;
        itemCount: number;
        overallItemsProcessed: number;
        overallitemsSucceeded: number;
        overallItemsFailed: number;
        statusDateTime: KnockoutObservable<Date> = ko.observable();
        outcome: string;
        jobCreatedTime: KnockoutObservable<Date> = ko.observable();

        percentComplete: KnockoutComputed<string> = ko.computed(function () {
            if (this.itemCount && this.overallItemsProcessed) {
                let percentValue = (this.overallItemsProcessed / this.itemCount) * 100;
                return percentValue + "% completed";
            }
            else {
                return "";
            }
        }, this);

        statusDateTimeDisplay: KnockoutComputed<string> = ko.computed(function () {
            if (this.statusDateTime()) {
                let date: Date = new Date(this.statusDateTime());
                let dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
                return date.toLocaleString('en-GB', dateOptions);
            }
            else {
                return 'not available';
            }
        }, this);

        jobCreatedTimeDisplay: KnockoutComputed<string> = ko.computed(function () {
            if (this.jobCreatedTime()) {
                let date: Date = new Date(this.jobCreatedTime());
                let dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
                return date.toLocaleString('en-GB', dateOptions);
            }
            else {
                return 'unknown';
            }
        }, this);
    }
}