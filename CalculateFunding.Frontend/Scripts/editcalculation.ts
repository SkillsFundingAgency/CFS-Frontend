namespace calculateFunding.editCalculation {

    export class EditCalculationViewModel {
        public state: KnockoutObservable<string> = ko.observable("idle");

        public sourceCode: KnockoutObservable<string> = ko.observable();

        public canBuildCalculation: KnockoutComputed<boolean>;

        public canSaveCalculation: KnockoutObservable<boolean> = ko.observable(false);

        public calculationBuilt: KnockoutObservable<boolean> = ko.observable(false);

        public saveCalculationResult: KnockoutObservable<string> = ko.observable(null);

        public buildOutput: KnockoutObservable<string> = ko.observable();

        public compilerResponse: KnockoutObservable<IPreviewCompileResultReponse> = ko.observable(null);

        private options: IEditCalculationViewModelOptions;

        constructor(options: IEditCalculationViewModelOptions) {
            if (!options.calculationId) {
                throw new Error("calculationId not provided in options");
            }

            if (!options.specificationId) {
                throw new Error("specificationId not provided in options");
            }

            this.options = options;

            let self = this;

            this.canBuildCalculation = ko.computed(() => {
                if (self.state() === "buildingCalculation") {
                    return false;
                }

                if (self.sourceCode()) {
                    return true;
                } else {
                    return false;
                }
            });
        }

        public buildCalculation() {
            if (this.state() === "idle") {
                this.state("buildingCalculation");
                this.buildOutput("Compiling...");
                this.compilerResponse(null);
                this.calculationBuilt(false);

                let data = {
                    calculationId: this.options.calculationId,
                    sourceCode: this.sourceCode(),
                };

                let request = $.ajax({
                    url: "/api/preview/compile",
                    data: JSON.stringify(data),
                    dataType: "json",
                    method: "POST",
                    contentType: "application/json"
                });

                let self = this;

                request.fail((error) => {
                    let errorMessage = "Error sending code to server:\n";
                    errorMessage += "Status: " + error.status;
                    self.buildOutput(errorMessage);
                    self.state("idle");
                });

                request.done((response) => {
                    self.buildOutput("");
                    if (response) {
                        let compilerResponse: IPreviewCompileResultReponse = response;
                        self.compilerResponse(compilerResponse);
                        if (compilerResponse.compilerOutput.success) {
                            self.canSaveCalculation(true);
                            self.calculationBuilt(true);
                        }
                    }


                    self.state("idle");
                });
            }
        }

        public saveCalculation() {
            if (this.state() === "idle" && this.canSaveCalculation()) {
                let data = {
                    sourceCode: this.sourceCode(),
                };

                let request = $.ajax({
                    url: "/api/specs/" + this.options.specificationId + "/calculations/" + this.options.calculationId,
                    data: JSON.stringify(data),
                    dataType: "json",
                    method: "POST",
                    contentType: "application/json"
                });

                let self = this;

                request.fail((error) => {
                    let errorMessage = "Error saving calculation:\n";
                    errorMessage += "Status: " + error.status;
                    self.saveCalculationResult(errorMessage);
                    self.state("idle");
                });

                request.done((successText) => {
                    self.state("idle");

                    // Redirect back to Manage Calculations page
                    window.location.href = "/calcs";
                });
            }
        }
    }

    interface IEditCalculationViewModelOptions {
        calculationId: string,
        specificationId: string,
    }

    interface IPreviewCompileResultReponse {
        compilerOutput: ICompilerOutputResponse;
    }

    interface ICompilerOutputResponse {
        success: Boolean;
        compilerMessages: Array<ICompilerMessageResponse>
    }

    interface ICompilerMessageResponse {
        severity: string;
        message: string;
    }
}