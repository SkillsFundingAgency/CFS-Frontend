/// <reference path="common.d.ts" />
/// <reference path="provider.completion.vb.ts" />

namespace calculateFunding.createadditionalcalculation {

    export class CreateAdditionalCalculationViewModel {
        public state: KnockoutObservable<string> = ko.observable("idle");

        public sourceCode: KnockoutObservable<string> = ko.observable();

        public calculationName: KnockoutObservable<string> = ko.observable();

        public calculationValueType: KnockoutObservable<string> = ko.observable();

        public canBuildCalculation: KnockoutComputed<boolean>;

        public canSaveCalculation: KnockoutComputed<boolean>;

        public canApproveCalculation: KnockoutComputed<boolean>;

        public calculationBuilt: KnockoutObservable<boolean> = ko.observable(false);

        public saveCalculationResult: KnockoutObservable<string> = ko.observable(null);

        public buildOutput: KnockoutObservable<string> = ko.observable();

        public compilerResponse: KnockoutObservable<IPreviewCompileResultReponse> = ko.observable(null);

        private options: ICreateAdditionalCalculationViewModelOptions;

        private successfulCompileSourceCode: KnockoutObservable<string> = ko.observable(null);

        private initialCodeContents: string;

        public intellisenseContext: KnockoutObservable<Array<calculateFunding.common.ITypeInformationResponse>> = ko.observable(null);

        private codeContext: calculateFunding.providers.VisualBasicIntellisenseProvider = new calculateFunding.providers.VisualBasicIntellisenseProvider();

        public doesUserHavePermissionToApproveOrEdit: KnockoutObservable<boolean> = ko.observable(false);

        public calculationNameIsValid: KnockoutObservable<boolean> = ko.observable(true);

        public calculationNameMessage: KnockoutObservable<string> = ko.observable();

        constructor(options: ICreateAdditionalCalculationViewModelOptions) {
            if (!options.calculationId) {
                throw new Error("calculationId not provided in options");
            }

            if (!options.specificationId) {
                throw new Error("specificationId not provided in options");
            }

            //if (!options.calculationName) {
            //    throw new Error("calculation name not provided in options");
            //}

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
                // Does the user have permission
                //if (!self.doesUserHavePermissionToApproveOrEdit()) {
                //    return false;
                //}

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

            this.canApproveCalculation = ko.pureComputed(() => {
                // Does the user have permission
                if (!self.doesUserHavePermissionToApproveOrEdit()) {
                    return false;
                }

                // Code must be the same as when the page loads - otherwise the user needs to save and then come back to the page
                if (self.initialCodeContents === self.sourceCode()) {
                    return true;
                }

                return false;
            });

            $(window).on('beforeunload',
                () => {
                    if (self.initialCodeContents !== self.sourceCode() && self.state() !== "redirecting") {
                        return "You have unsaved calculation script changes";
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
                    url: "/api/specs/" + this.options.specificationId + "/calculations/" + this.options.calculationId + "/compilePreview",
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
                this.calculationNameIsValid(true);
                this.calculationNameMessage("");

                this.state("savingcalculation");
                let data = {
                    sourceCode: this.sourceCode(),
                    calculationName: this.calculationName(),
                    calculationType: this.calculationValueType()
                };

                let request = $.ajax({
                    url: "/api/specs/" + this.options.specificationId + "/calculations/createadditionalcalculation",
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
                    let resp = error.responseJSON as IModelState;
                    if (resp != undefined) {
                        if (resp.CalculationName != null) {
                            this.calculationNameIsValid(false);
                            var message = resp.CalculationName.toString();
                            this.calculationNameMessage(message);
                        }
                    }

                    self.state("idle");
                });

                request.done((successText) => {
                    self.state("redirecting");
                    window.location.href = `/calcs/additionalcalculations/${this.options.specificationId}`;
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
                    let dataTypes: common.ITypeInformationResponse[] = ko.utils.arrayFilter(result, (item: common.ITypeInformationResponse) => {
                        return item.type === "DefaultType";
                    });

                    let keywordList: common.ITypeInformationResponse[] = ko.utils.arrayFilter(result, (item: common.ITypeInformationResponse) => {
                        return item.type === "Keyword";
                    });

                    if (calculationType) {

                        // Local Functions
                        for (let m in calculationType.methods) {
                            let currentMethod: calculateFunding.common.IMethodInformationResponse = calculationType.methods[m];

                            if (currentMethod.friendlyName !== self.options.calculationName) {
                                let functionInformation: calculateFunding.providers.ILocalFunction = new calculateFunding.providers.VisualBasicSub({
                                    label: currentMethod.name,
                                    description: currentMethod.description,
                                    returnType: currentMethod.returnType,
                                    parameters: [],
                                    friendlyName: currentMethod.friendlyName,
                                    isCustom: currentMethod.isCustom
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
                                //this is implicity feature toggled as determined in the type information set from the back end
                                if (functionInformation.isCustom) {

                                    let variable: providers.IVariable = {
                                        name: currentMethod.name,
                                        friendlyName: currentMethod.friendlyName,
                                        description: currentMethod.description + " function aggregate",
                                        type: currentMethod.returnType,
                                        items: {},
                                        isAggregable: "true"
                                    };

                                    variables[variable.name.toLowerCase()] = variable;
                                }

                                functions[functionInformation.label.toLowerCase()] = functionInformation;
                            }
                        }
                    }

                    let defaultTypes: providers.IDefaultTypeContainer = {};

                    if (dataTypes) {
                        for (let dt in dataTypes) {
                            let defaultType: providers.IDefaultType = {
                                label: dataTypes[dt].name,
                                description: dataTypes[dt].description,
                                items: {}
                            };

                            defaultTypes[dataTypes[dt].name.toLowerCase()] = defaultType;
                        }
                    }

                    let keywords: providers.IKeywordsContainer = {};

                    if (keywordList) {
                        for (let kw in keywordList) {
                            let keyword: providers.IKeyword = {
                                label: keywordList[kw].name
                            };

                            keywords[keywordList[kw].name] = keyword;
                        }
                    }

                    // Variables
                    for (let v in calculationType.properties) {
                        let propertyInfo: common.IPropertyInformationResponse = calculationType.properties[v];
                        let variable: providers.IVariable = CreateAdditionalCalculationViewModel.convertPropertyInformationReponseToVariable(propertyInfo, result);

                        variables[variable.name.toLowerCase()] = variable;
                    }

                    self.codeContext.setContextVariables(variables);
                    self.codeContext.setLocalFunctions(functions);
                    self.codeContext.setDefaultTypes(defaultTypes);
                    self.codeContext.setKeywords(keywords);
                });
            }
        }

        private static convertPropertyInformationReponseToVariable(property: common.IPropertyInformationResponse, types: Array<common.ITypeInformationResponse>): providers.IVariable {
            let variable: providers.IVariable = {
                name: property.name,
                friendlyName: property.friendlyName,
                description: property.description,
                type: property.type,
                items: {},
                isAggregable: property.isAggregable
            };

            let typeInformation = ko.utils.arrayFirst(types, (item: common.ITypeInformationResponse) => {
                return item.name === variable.type;
            });

            if (typeInformation) {
                for (let i in typeInformation.properties) {
                    let childVariable: providers.IVariable = CreateAdditionalCalculationViewModel.convertPropertyInformationReponseToVariable(typeInformation.properties[i], types);
                    variable.items[childVariable.name.toLowerCase()] = childVariable;
                }
            }

            return variable;
        }

        /* Register types for the monaco editor to support Intellisense */
        public registerMonacoProviders(viewModel: CreateAdditionalCalculationViewModel) {
            console.log("Registering monaco providers");
            monaco.languages.registerCompletionItemProvider('vb', viewModel.codeContext.getCompletionProvider());
            monaco.languages.registerHoverProvider('vb', viewModel.codeContext.getHoverProvider());
        }
    }

    export interface ICreateAdditionalCalculationViewModelOptions {
        calculationId: string,
        specificationId: string,
        existingSourceCode: string,
        calculationName: string,
        newEditCalculationPageBeEnabled: string;
    }

    export interface IPreviewCompileResultReponse {
        compilerOutput: ICompilerOutputResponse;
    }

    export interface ICompilerOutputResponse {
        success: Boolean;
        compilerMessages: Array<ICompilerMessageResponse>;
    }

    export interface ICompilerMessageResponse {
        severity: string;
        message: string;
    }

    export interface IModelState {
        CalculationName: {}
    }
}