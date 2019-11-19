﻿/// <reference path="../node_modules/@aspnet/signalr/dist/esm/index.d.ts" />

namespace calculateFunding.notifications {
    export abstract class NotificationsViewModel {
        private _hubConnection: signalR.HubConnection;
        private connectionRetries: number = 0;

        connectionError: KnockoutObservable<boolean> = ko.observable(false);

        currentStatus: KnockoutObservable<JobStatus> = ko.observable(new JobStatus());

        constructor() {
            this.init();
        }

        private init() : void {
            let self = this;

            this._hubConnection = new signalR.HubConnectionBuilder()
                .withUrl("/api/notifications")
                .build();

            this._hubConnection.onclose((error) => { self.onConnectionError(error, self); });

            this._hubConnection.on("NotificationEvent", (message) => {
                self.receivedNotification(self, message);
            });

            this._hubConnection.on("JoinGroup", (data: string) => {
                console.log("joined group - " + data);
            });

            this._hubConnection.on("LeaveGroup", (data: string) => {
                console.log("left group - " + data);
            });

            this._hubConnection.start()
                .then(function () {
                    self.onConnectedToSignalr(self._hubConnection);
                    self.connectionRetries = 0;
                    self.connectionError(false);
                })
                .catch(function (error) {
                    console.error(error.message);

                    if (self.connectionRetries < 3) {
                        self.connectionRetries++;
                        setTimeout(self.init, 1000 * (self.connectionRetries));
                    }
                    else {
                        self.connectionError(true);
                    }
                });
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

        protected abstract onConnected(): void;

        protected abstract onJobStarted(jobType: string): void;

        protected abstract onJobCompleted(status: CompletionStatus, jobType: string): void;

        protected loadLatestJobStatus(latestJobStatus: IJobSummary) {
            if (latestJobStatus) {
                console.log("Processing initial job status for job id '" + latestJobStatus.jobId + "' and job type '" + latestJobStatus.jobType + "'");

                let status = new JobStatus();
                status.jobId = latestJobStatus.jobId;
                status.jobType = latestJobStatus.jobType;
                status.completedSuccessfully = latestJobStatus.completionStatus === CompletionStatus.Succeeded;
                status.invoker = latestJobStatus.invokerUserDisplayName;
                status.running = latestJobStatus.runningStatus !== RunningStatus.Completed;
                status.statusDateTime(latestJobStatus.lastUpdated);
                status.jobCreatedTime(latestJobStatus.created);

                this.currentStatus(status);

                if (status.running) {
                    this.onJobStarted(status.jobType);
                }
            }
        }

        private receivedNotification(viewModel: NotificationsViewModel, notification: JobNotification): void {
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

            if (!notification.parentJobId && notification.runningStatus === RunningStatus.Completed) {
                viewModel.onJobCompleted(notification.completionStatus, notification.jobType);
            }
        }

        private onConnectedToSignalr(connection: signalR.HubConnection) {
            console.log("signalr connection started");

            this.onConnected();
        }

        private onConnectionError(error: Error, vm : NotificationsViewModel ) {
            if (error && error.message) {
                console.error(error.message);
                setTimeout(vm.init, 3000);
            }
        }
    }

    export class SearchNotificationsViewModel extends NotificationsViewModel {
        private specificationId: string;
        private searchViewModel: calculateFunding.search.SearchViewModel;
        private jobTypeThatDirectlyAffectsResults: string;    // Job type that directly generates results
        private jobTypesThatUlimatelyAffectResults: string[]; // Job types that precede job that generates results

        public totalErrorCount: KnockoutObservable<number> = ko.observable(0);

        constructor(specificationId: string, latestJobStatus: IJobSummary, searchViewModel: calculateFunding.search.SearchViewModel, jobTypeThatDirectlyAffectsResults: string, jobTypesThatUlimatelyAffectResults: string[]) {
            super();
            this.specificationId = specificationId;
            this.searchViewModel = searchViewModel;
            this.jobTypeThatDirectlyAffectsResults = jobTypeThatDirectlyAffectsResults;
            this.jobTypesThatUlimatelyAffectResults = jobTypesThatUlimatelyAffectResults;

            this.loadLatestJobStatus(latestJobStatus);

            // Update total errors based on the parent view model results
            if (searchViewModel && searchViewModel.totalErrorCount) {
                let self = this;

                searchViewModel.totalErrorCount.subscribe((totalErrors: number) => {
                    self.totalErrorCount(totalErrors);
                });
            }
        }

        protected onConnected(): void {
            this.startWatchingForSpecificationNotifications(this.specificationId);
        }

        protected onJobStarted(jobType: string): void {
            if (jobType === this.jobTypeThatDirectlyAffectsResults || (this.jobTypesThatUlimatelyAffectResults && this.jobTypesThatUlimatelyAffectResults.some(t => t == jobType))) {
                this.searchViewModel.areResultsBeingUpdated(true);
            }
        }

        protected onJobCompleted(status: CompletionStatus, jobType: string): void {
            if (status === CompletionStatus.Succeeded && jobType === this.jobTypeThatDirectlyAffectsResults) {
                console.log("received completed notification - updating search results");
                this.searchViewModel.performSearch(this.searchViewModel.pageNumber());

                this.searchViewModel.areResultsBeingUpdated(false);
            }
        }
    }

    export interface IJobSummary {
        jobId: string;
        jobType: string;
        specificationId: string;
        entityId: string;
        runningStatus: RunningStatus;
        completionStatus: CompletionStatus;
        invokerUserId: string;
        invokerUserDisplayName: string;
        parentJobId: string;
        lastUpdated: Date;
        created: Date;
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

    class Trigger {
        message: string;
        entityId: string;
        entityType: string;
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
}