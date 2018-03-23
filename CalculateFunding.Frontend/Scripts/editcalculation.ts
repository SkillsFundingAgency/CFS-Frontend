/// <reference path="common.d.ts" />
/// <reference path="provider.completion.vb.ts" />

namespace calculateFunding.editCalculation {

    export class EditCalculationViewModel {
        public state: KnockoutObservable<string> = ko.observable("idle");

        public sourceCode: KnockoutObservable<string> = ko.observable();

        public canBuildCalculation: KnockoutComputed<boolean>;

        public canSaveCalculation: KnockoutComputed<boolean>;

        public calculationBuilt: KnockoutObservable<boolean> = ko.observable(false);

        public saveCalculationResult: KnockoutObservable<string> = ko.observable(null);

        public buildOutput: KnockoutObservable<string> = ko.observable();

        public compilerResponse: KnockoutObservable<IPreviewCompileResultReponse> = ko.observable(null);

        private options: IEditCalculationViewModelOptions;

        private successfulCompileSourceCode: KnockoutObservable<string> = ko.observable(null);

        private initialCodeContents: string;

        public intellisenseContext: KnockoutObservable<Array<calculateFunding.common.ITypeInformationResponse>> = ko.observable(null);

        private codeContext: calculateFunding.providers.VisualBasicIntellisenseProvider = new calculateFunding.providers.VisualBasicIntellisenseProvider();

        constructor(options: IEditCalculationViewModelOptions) {
            if (!options.calculationId) {
                throw new Error("calculationId not provided in options");
            }

            if (!options.specificationId) {
                throw new Error("specificationId not provided in options");
            }

            this.options = options;

            this.initialCodeContents = options.existingSourceCode;
            this.sourceCode(options.existingSourceCode);

            let self = this;

            this.canBuildCalculation = ko.computed(() => {
                if (this.state() !== "idle") {
                    return false;
                }

                if (self.sourceCode()) {
                    return true;
                } else {
                    return false;
                }
            });

            this.canSaveCalculation = ko.computed(() => {
                // Has the user entered source code
                if (!self.successfulCompileSourceCode()) {
                    return false;
                }

                // Disable save if content is the same as existing verion
                if (self.sourceCode() == self.initialCodeContents) {
                    return false;
                }

                if (this.state() !== "idle") {
                    return false;
                }

                // Is the source code different to last successful compile
                return self.successfulCompileSourceCode() === self.sourceCode();
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
                            self.calculationBuilt(true);
                            self.successfulCompileSourceCode(self.sourceCode());
                        }
                    }

                    self.state("idle");
                });
            }
        }

        public saveCalculation() {
            if (this.state() === "idle" && this.canSaveCalculation()) {
                this.state("savingcalculation");
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

        public loadIntellisenseContext() {
            if (this.state() === "idle") {
                this.state("loadingIntellisense");
                let request = $.ajax({
                    url: "/api/specs/" + this.options.specificationId + "/codeContext",
                    dataType: "json",
                    method: "GET",
                    contentType: "application/json"
                });

                let self = this;

                request.fail((error) => {
                    let errorMessage = "Error saving calculation:\n";
                    errorMessage += "Status: " + error.status;
                    self.saveCalculationResult(errorMessage);
                    self.state("idle");
                });

                request.done((result: Array<calculateFunding.common.ITypeInformationResponse>) => {
                    self.state("idle");

                    let variables: calculateFunding.providers.IVariableContainer = {};
                    let functions: calculateFunding.providers.ILocalFunctionContainer = {};
                    let calculationType: common.ITypeInformationResponse = ko.utils.arrayFirst(result, (item: common.ITypeInformationResponse) => {
                        return item.name === "Calculations";
                    });

                    if (calculationType) {

                        // Local Functions
                        for (let m in calculationType.methods) {
                            let currentMethod: calculateFunding.common.IMethodInformationResponse = calculationType.methods[m];

                            let functionInformation: calculateFunding.providers.ILocalFunction = new calculateFunding.providers.VisualBasicSub({
                                label: currentMethod.name,
                                description: currentMethod.description,
                                returnType: currentMethod.returnType,
                                parameters: [],
                            });

                            for (let p in currentMethod.parameters) {
                                let parameter = currentMethod.parameters[p];
                                let parameterInformation: calculateFunding.providers.IFunctionParameter = {
                                    name: parameter.name,
                                    description: parameter.description,
                                    type: parameter.type,
                                };

                                functionInformation.parameters.push(parameterInformation);
                            }

                            functions[functionInformation.label.toLowerCase()] = functionInformation;
                        }
                    }

                    // Variables
                    for (let v in calculationType.properties) {
                        let propertyInfo: common.IPropertyInformationResponse = calculationType.properties[v];
                        let variable: providers.IVariable = EditCalculationViewModel.convertPropertyInformationReponseToVariable(propertyInfo, result);

                        variables[variable.name.toLowerCase()] = variable;
                    }

                    self.codeContext.setContextVariables(variables);
                    self.codeContext.setLocalFunctions(functions);

                });
            }
        }

        private static convertPropertyInformationReponseToVariable(property: common.IPropertyInformationResponse, types: Array<common.ITypeInformationResponse>): providers.IVariable {
            let variable: providers.IVariable = {
                name: property.name,
                description: property.description,
                type: property.type,
                items: {}
            };

            let typeInformation = ko.utils.arrayFirst(types, (item: common.ITypeInformationResponse) => {
                return item.name == variable.type;
            });

            if (typeInformation) {
                for (let i in typeInformation.properties) {
                    let childVariable: providers.IVariable = EditCalculationViewModel.convertPropertyInformationReponseToVariable(typeInformation.properties[i], types);
                    variable.items[childVariable.name.toLowerCase()] = childVariable;
                }
            }

            return variable;
        }

        /* Register types for the monaco editor to support Intellisense */
        public registerMonacoProviders(viewModel: EditCalculationViewModel) {
            console.log("Registering monaco providers");
            monaco.languages.registerCompletionItemProvider('vb', viewModel.codeContext.getCompletionProvider());
            monaco.languages.registerHoverProvider('vb', viewModel.codeContext.getHoverProvider());
        }
    }

    export interface IEditCalculationViewModelOptions {
        calculationId: string,
        specificationId: string,
        existingSourceCode: string,
    }

    export interface IPreviewCompileResultReponse {
        compilerOutput: ICompilerOutputResponse;
    }

    export interface ICompilerOutputResponse {
        success: Boolean;
        compilerMessages: Array<ICompilerMessageResponse>
    }

    export interface ICompilerMessageResponse {
        severity: string;
        message: string;
    }
}