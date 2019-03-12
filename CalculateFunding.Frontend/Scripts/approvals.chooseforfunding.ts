namespace calculateFunding.approvals {

    interface ITemplateData {
        jobInvokerDisplayName: string;
        jobCreatedAt: string,
        modalTitle: string
    }

    export class CheckLastJobStatusViewModel
    {
        private readonly instructCalculationsJobDefinitionId: string = "CreateInstructAllocationJob";

        private readonly instructAggregationsCalculationsJobDefinitionId: string = "CreateInstructGenerateAggregationsAllocationJob";

        public messageTemplateData: ITemplateData = { jobInvokerDisplayName: "", jobCreatedAt: "", modalTitle: "Unable to choose specification"};

        public modalVisible: KnockoutObservable<boolean> = ko.observable(false);

        public bodyTemplate: KnockoutObservable<string> = ko.observable("blankTemplate");

        public bodyData: KnockoutComputed<any>;

        public modalSize: KnockoutObservable<string> = ko.observable('funding-modal');

        public constructor() {

            var self = this;

            self.bodyData = ko.computed(function () {
                return self.messageTemplateData;
            });
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

    }
}