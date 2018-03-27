/// <reference path="common.d.ts" />
/// <reference path="provider.completion.vb.ts" />

namespace calculateFunding.createTestScenario {

    export class CreateTestScenarioViewModel {
        public state: KnockoutObservable<string> = ko.observable("idle");

        public specificationId: KnockoutObservable<string> = ko.observable("");

        public name: KnockoutObservable<string> = ko.observable("");

        public description: KnockoutObservable<string> = ko.observable("");

        public sourceCode: KnockoutObservable<string> = ko.observable("");

        public isFormVisible: KnockoutComputed<boolean>;

        public isValidationSummaryVisible: KnockoutComputed<boolean>;

        public isCreateScenarioButtonEnabled: KnockoutComputed<boolean>;

        public isSpecificationIdValid: KnockoutObservable<boolean> = ko.observable(true);

        public isNameValid: KnockoutObservable<boolean> = ko.observable(true);

        public isDescriptionValid: KnockoutObservable<boolean> = ko.observable(true);

        public isSourceCodeValid: KnockoutObservable<boolean> = ko.observable(true);

        public validationLinks: KnockoutObservableArray<IValidationLink> = ko.observableArray([]);

        public canRunTest: KnockoutComputed<boolean>;

        public canSaveTestScenario: KnockoutComputed<boolean>;

        public testBuilt: KnockoutObservable<boolean> = ko.observable(false);

        public testOutput: KnockoutObservable<string> = ko.observable();

        public saveTestScenarioResult: KnockoutObservable<string> = ko.observable(null);

        public buildValidation: KnockoutObservable<string> = ko.observable();

        public validationResponse: KnockoutObservableArray<calculateFunding.common.IScenarioCompileErrorResponse> = ko.observableArray([]);

        public validationRequested: KnockoutObservable<boolean> = ko.observable(false);

        private successfulValidationSourceCode: KnockoutObservable<string> = ko.observable(null);

        private initialCodeContents: string;

        constructor() {

            let self = this;

            //self.isFormVisible = ko.pureComputed(() => {
            //    return self.state() === "idle";
            //});

            self.isValidationSummaryVisible = ko.pureComputed(() => {
                return !(this.isSpecificationIdValid() && this.isNameValid() && this.isDescriptionValid());
            });

            self.isCreateScenarioButtonEnabled = ko.computed(() => {
                let isEnabled = (this.description().length > 0
                    && this.specificationId().length > 0
                    && this.name().length > 0);
                return isEnabled;
            });

            this.canRunTest = ko.computed(() => {
                if (self.state() !== "idle") {
                    return false;
                }

                if (!self.sourceCode()) {
                    return false;
                }

                if (!self.specificationId()) {
                    return false;
                }

                return true;
            });

            this.canSaveTestScenario = ko.computed(() => {
                // Has the user entered the test cases
                if (!self.successfulValidationSourceCode()) {
                    return false;
                }

                // Disable save if content is the same
                if (self.sourceCode() !== self.successfulValidationSourceCode()) {
                    return false;
                }

                if (this.state() !== "idle") {
                    return false;
                }

                if (!this.specificationId()) {
                    return false;
                }

                return true;
            });

        }

        private resetValidation() {
            this.isNameValid(true);
            this.isDescriptionValid(true);
            this.isSpecificationIdValid(true);
        }

        public compileTestScenario() {

            if (this.state() === "idle") {
                this.state("compilingTest");
                this.buildValidation("Building......");
                this.validationResponse([]);
                this.validationRequested(true);
                this.testBuilt(false);

                //check  
                let data = {
                    gherkin: this.sourceCode(),
                };

                // Parsing requests to be set here

                let request = $.ajax({
                    url: "/api/specs/" + this.specificationId() + "/scenario-compile",
                    data: JSON.stringify(data),
                    dataType: "json",
                    method: "POST",
                    contentType: "application/json",
                });

                let self = this;

                request.fail((error) => {
                    let errorMessage = "Error sending code to server: \n";
                    errorMessage += "Status: " + error.status;
                    self.buildValidation(errorMessage);
                    self.state("idle");
                });

                request.done((response) => {
                    self.buildValidation("");
                    if (response) {
                        let parseResponse: Array<calculateFunding.common.IScenarioCompileErrorResponse> = response;
                        self.validationResponse(parseResponse);
                        if (parseResponse.length == 0) {
                            self.testBuilt(true);
                            self.successfulValidationSourceCode(self.sourceCode());
                        }
                        else {
                            self.testBuilt(false);
                        }
                    }
                    self.state("idle");
                });
            }
        }

        public saveTestScenario() {

            if (this.state() !== "idle") {
                return;
            }

            let data = {
                scenario: this.sourceCode(),
                name: this.name(),
                description: this.description(),
            };

            let request = $.ajax({
                url: "/api/specs/" + this.specificationId() + "/scenarios",
                data: JSON.stringify(data),
                dataType: "json",
                method: "PUT",
                contentType: "application/json"
            });

            let self = this;

            self.state("Creating test scenario");

            request.fail((response) => {
                self.state("idle");
                if (response.status === 400) {
                    self.handleValidationFormFailed(response.responseJSON);
                }
            });

            request.done((response) => {
                alert("Test scenario created");
            });
        }

        private handleValidationFormFailed(modelState: ICreateNewTestScenarioModelState) {
            this.resetValidation();

            this.validationLinks([]);

            if (modelState.Name && modelState.Name.length > 0) {
                this.isNameValid(false);
                let link = {
                    href: "#field-CreateTestScenarioModel-Name",
                    message: modelState.Name[0],
                    id: "validation-link-for-CreateTestScenarioModel-Name"
                }
                this.validationLinks.push(link);
            }

            if (modelState.Description && modelState.Description.length > 0) {
                this.isDescriptionValid(false);
                let link = {
                    href: "#field-CreateTestScenarioModel-Description",
                    message: modelState.Description[0],
                    id: "validation-link-for-CreateTestScenarioModel-Description"
                }
                this.validationLinks.push(link);
            }

            if (modelState.SpecificationId && modelState.SpecificationId.length > 0) {
                this.isSpecificationIdValid(false);
                let link = {
                    href: "#field-CreateTestScenarioModel-Specification",
                    message: modelState.SpecificationId[0],
                    id: "validation-link-for-CreateTestScenarioModel-Specification"
                }
                this.validationLinks.push(link);
            }

            if (modelState.SourceCode && modelState.SourceCode.length > 0) {
                this.isSourceCodeValid(false);
                let link = {
                    href: "#field-CreateTestScenarioModel-SourceCode",
                    message: modelState.SourceCode[0],
                    id: "validation-link-for-CreateTestScenarioModel-SourceCode"
                }

                this.validationLinks.push(link);
            }

        }

        /* Register types for the monaco editor to support intellisense */
        public registerMonacoProviders(viewModel: CreateTestScenarioViewModel) {
            console.log("Registering monaco providers");
        }
    }

    export interface IParseScenarioResultReponse {
        parserOutput: IParserOutputResponse;
    }

    export interface IParserOutputResponse {
        success: Boolean;
        compilerMessages: Array<IParserMessageResponse>
    }

    export interface IParserMessageResponse {
        sererity: string;
        message: string;
    }


    export interface IValidationLink {
        href: string;
        message: string;
        id: string;
    }

    export interface ICreateNewTestScenarioModelState {
        Name: string[];
        SpecificationId: string[];
        Description: string[];
        SourceCode: string[];

    }

    //Required in future for Edit scenario page  
    export interface ICreateNewTestScenarioResponseModel {
        specificationId: string;
        scenarioId: string;
        author: IAuthorReference;
        name: string;
        description: string;
        sourceCode: string;
    }

    export interface IAuthorReference {
        id: string;
        name: string;
    }

}