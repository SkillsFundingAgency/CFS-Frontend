namespace calculateFunding.components.approveStatusButton {
    export class ApproveStatusButtonViewModel {
        public publishStatus: KnockoutObservable<PublishStatus> = ko.observable(PublishStatus.Draft);

        public buttonCssClass: KnockoutComputed<string>;

        public canApprove: KnockoutComputed<boolean>;

        public isLoading: KnockoutObservable<boolean>;

        public state: KnockoutObservable<ControlState> = ko.observable(ControlState.Idle);

        private url: string;

        public constructor(options: IApproveStatusPublishStateViewModelOptions) {
            if (typeof options.publishStatus === "undefined") {
                throw new Error("publishStatus is not defined in options");

            }

            if (!options.publishStatus) {
                throw new Error("publishStatus was null in provided options");
            }

            this.publishStatus(options.publishStatus);


            if (typeof options.stateChangeUrl === "undefined") {
                throw new Error("stateChangeUrl is not defined in options");
            }

            if (!options.stateChangeUrl) {
                throw new Error("stateChangeUrl was null in provided options");
            }

            this.url = options.stateChangeUrl;

            let self: ApproveStatusButtonViewModel = this;

            this.buttonCssClass = ko.pureComputed(() => {
                if (this.state() === ControlState.Loading) {
                    return "btn-status-loading";
                } else if (self.publishStatus() === PublishStatus.Draft) {
                    return "btn-status-draft";
                } else if (self.publishStatus() === PublishStatus.Approved) {
                    return "btn-status-approved";
                }
                else if (this.publishStatus() === PublishStatus.Updated) {
                    return "btn-status-updated";
                }

                return null;
            });

            this.canApprove = ko.pureComputed(() => {
                if (typeof options.canApprove !== "undefined") {
                    if (!options.canApprove()) {
                        return false;
                    }
                }
                return this.publishStatus() !== PublishStatus.Approved && this.state() === ControlState.Idle;
            });

            this.isLoading = ko.pureComputed(() => {
                return self.state() !== ControlState.Idle;
            });
        }

        public approve() {
            if (this.state() === ControlState.Idle) {
                let data = {
                    publishStatus: "Approved",
                }

                this.state(ControlState.Loading);

                let settings: JQueryAjaxSettings = {
                    data: JSON.stringify(data),
                    url: this.url,
                    dataType: 'json',
                    contentType: 'application/json',
                    method: 'put',
                };

                let ajaxQuery = $.ajax(settings);

                let self = this;

                ajaxQuery.done((result) => {
                    if (result) {
                        if (typeof result.publishStatus !== "undefined") {
                            self.publishStatus(result.publishStatus);
                        }
                        else {
                            self.publishStatus(PublishStatus.Approved);
                        }
                    }
                    else {
                        self.publishStatus(PublishStatus.Approved);
                    }

                    self.state(ControlState.Idle);
                });

                ajaxQuery.fail(() => {
                    alert("Error changing published state");
                    self.state(ControlState.Idle);
                });
            }
        }
    }

    export enum PublishStatus {
        Draft = "Draft",
        Approved = "Approved",
        Updated = "Updated",
    };

    export enum ControlState {
        Loading = "loading",
        Idle = "idle",
    }

    export interface IApproveStatusPublishStateViewModelOptions {
        publishStatus: PublishStatus,
        stateChangeUrl: string;
        canApprove? : KnockoutObservable<boolean>
    }
}