namespace calculateFunding.ConfirmSpecificationForFunding {

    export class ConfirmationViewModel {

        private specificationId: string;
        private fundingPeriodId: string;
        private fundingStreamId: string;

        constructor(options: IConfirmationViewModelConstructorParameters) {

            let self = this;

            if (typeof options === "undefined") {
                throw new Error("options is undefined")
            }

            if (options) {

                self.specificationId = options.specificationId;
                self.fundingPeriodId = options.fundingPeriodId;
                self.fundingStreamId = options.fundingStreamId;
            }
        }

        public RegisterClickEvent(): void {

            let self = this;

            $("#confirm-button").on("click", function (e) {
                self.Confirm();
            });
        }

        private Confirm(): void {

            let self = this;

            let url = "/api/specs/" + self.specificationId + "/selectforfunding";

            self.ShowSpinner();

            $.ajax({
                type: "POST",
                url: url,
                success: function () {
                    self.Redirect(self.specificationId, self.fundingPeriodId, self.fundingStreamId)
                },
                error: self.Error
            });
        }

        private ShowSpinner(): void {

            $("#main-container").hide();

            $(".breadcrumbs").hide();

            $(".heading-large").hide();

            $("#wait-state-container").show();
        }

        private HideSpinner(): void {

            $("#main-container").show();

            $(".breadcrumbs").show();

            $(".heading-large").show();

            $("#wait-state-container").hide();
        }

        private Redirect(specificationId: string, fundingPeriodId: string, fundingStreamId: string): void {

            let operationType = "SpecificationChosen"

            let redirectUrl = "/approvals/choose?fundingPeriod=" + fundingPeriodId + "&fundingStream=" + fundingStreamId + "&opertionType=" + operationType + "&operationId=" + specificationId;

            document.location.href = redirectUrl;
        }

        private Error(): void {

            let self = this;

            self.HideSpinner()

            alert("An error occurred whilst select specification for funding");
        }
    }

    export interface IConfirmationViewModelConstructorParameters {
        specificationId: string;
        fundingPeriodId: string;
        fundingStreamId: string;
    }

}