/// <reference path="common.d.ts" />
/// <reference path="provider.completion.gherkin.ts" />

namespace calculateFunding.editTestScenario {

    export class EditTestScenarioViewModel {
        private readonly stateKeyIntellisenseLoading: string = "intellisenseLoading";

        private readonly stateKeyCompilingTest : string = "compilingTest";

        public state: KnockoutObservable<string> = ko.observable("idle");

        public name: KnockoutObservable<string> = ko.observable();

        public savedTestScenarioName: KnockoutObservable<string> = ko.observable(null);

        public BannerText: KnockoutObservable<string> = ko.observable(null);

        public description: KnockoutObservable<string> = ko.observable();

        public scenarioId: KnockoutObservable<string> = ko.observable();

        public sourceCode: KnockoutObservable<string> = ko.observable();

        public isFormVisible: KnockoutComputed<boolean>;

        public isValidationSummaryVisible: KnockoutComputed<boolean>;

        public isCreateScenarioButtonEnabled: KnockoutComputed<boolean>;

        public isSpecificationIdValid: KnockoutObservable<boolean> = ko.observable(true);

        public isNameValid: KnockoutObservable<boolean> = ko.observable(true);

        public isDescriptionValid: KnockoutObservable<boolean> = ko.observable(true);

        public isSourceCodeValid: KnockoutObservable<boolean> = ko.observable(true);

        public isIntellisenseLoading: KnockoutComputed<boolean>;

        public validationLinks: KnockoutObservableArray<IValidationLink> = ko.observableArray([]);

        public canRunTest: KnockoutComputed<boolean>;

        public isCompilingTest: KnockoutComputed<boolean>;

        public compilingSeconds: KnockoutObservableArray<number> = ko.observableArray([]);

        public canSaveTestScenario: KnockoutComputed<boolean>;

        public testBuilt: KnockoutObservable<boolean> = ko.observable(false);

        public testOutput: KnockoutObservable<string> = ko.observable();

        public saveTestScenarioResult: KnockoutObservable<string> = ko.observable(null);

        public buildValidation: KnockoutObservable<string> = ko.observable();

        public validationResponse: KnockoutObservableArray<calculateFunding.common.IScenarioCompileErrorResponse> = ko.observableArray([]);

        public validationRequested: KnockoutObservable<boolean> = ko.observable(false);

        private successfulValidationSourceCode: KnockoutObservable<string> = ko.observable();

        public specificationId: string;

        private compilerSecondsFunctionReference: number;

        private completionProvider: calculateFunding.providers.GherkinIntellisenseProvider = new calculateFunding.providers.GherkinIntellisenseProvider();

        private codeContexts: ILoadedCodeContexts = {};

        private initialName: KnockoutObservable<string> = ko.observable();

        private initialDescription: KnockoutObservable<string> = ko.observable();

        private initialSourceCode: KnockoutObservable<string> = ko.observable();

        public hasGherkinEdited: KnockoutObservable<boolean> = ko.observable();

        constructor(options: IEditTestScenarioViewModelConstructorParameters) {
  
            if (typeof options === "undefined" ) {
                throw new Error("Constructor parameter options not passed");
            }

            if(typeof options.description === "undefined"){
                throw new Error("Constructor parameter variable description not passed");
            }

            if(typeof options.name === "undefined"){
                throw new Error("Constructor parameter variable name not passed");
            }

            if(typeof options.sourceCode === "undefined"){
                throw new Error("Constructor parameter variable sourcecode not passed");
            }   

            if(typeof options.scenarioId === "undefined"){
                throw new Error("Constructor parameter variable scenarioId not passed");
            }  

            if(typeof options.specificationId === "undefined"){
                throw new Error("Constructor parameter variable specificationId not passed");
            }  

            this.extractTestScenarioDetails(options);

            let self = this;

            self.loadIntellisenseContext(this.specificationId);
            self.completionProvider.setCalculations([]);
            self.completionProvider.setDatasets([]);

            self.isFormVisible = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            self.isValidationSummaryVisible = ko.pureComputed(() => {
                return !(this.isNameValid() && this.isDescriptionValid());
            });

            self.isCreateScenarioButtonEnabled = ko.computed(() => {
                let isEnabled = (this.description()                   
                    && this.name() && true);
                return isEnabled;
            });

            this.canRunTest = ko.computed(() => {
                if (self.state() !== "idle") {
                    return false;
                }

                if (!self.sourceCode() || (self.sourceCode() === self.initialSourceCode())) {
                    return false;
                }

                return true;
            });

            this.canSaveTestScenario = ko.computed(() => {
               
                if (this.state() !== "idle") {
                    return false;
                }
                else if (self.name() !== self.initialName() || self.description() !== self.initialDescription() || (self.sourceCode() !== self.initialSourceCode() && self.successfulValidationSourceCode())) {
                    return true;
                }
                
                return false;
            });

            this.hasGherkinEdited = ko.computed(() => {
                if(self.sourceCode() === self.initialSourceCode()){
                    return false;
                } else{
                    return true;
                }
            });

            self.isCompilingTest = ko.computed(() => {
                return self.state() === this.stateKeyCompilingTest;
            });

            this.isIntellisenseLoading = ko.pureComputed(() => {
                return self.state() === this.stateKeyIntellisenseLoading;
            });
        }

        private extractTestScenarioDetails(options: IEditTestScenarioViewModelConstructorParameters){
            this.name(options.name);
            this.description(options.description);        
            this.sourceCode(options.sourceCode); 
            this.initialSourceCode(options.sourceCode);
            this.scenarioId(options.scenarioId);

            // Included to identify, if name and description contents have changed 
            this.initialName(options.name);
            this.initialDescription(options.description);
            this.specificationId = options.specificationId;
           
        }

        private resetValidation() {
            this.isNameValid(true);
            this.isDescriptionValid(true);
        }

        public dismissSaveAlert(){
            this.savedTestScenarioName(null);
        }
        public compileTestScenario() {

            let self = this;
            if (this.state() === "idle") {
                this.state("compilingTest");
                this.buildValidation("Building......");
                this.validationResponse([]);
                this.validationRequested(true);
                this.testBuilt(false);
                this.compilingSeconds([]);
                this.compilerSecondsFunctionReference = setInterval(() => {
                    self.compilingSeconds.push(1);
                }, 1000);

                
                let data = {
                    gherkin: this.sourceCode(),
                };

                // Parsing requests to be set here

                let request = $.ajax({
                    url: "/api/specs/" + this.specificationId + "/scenario-compile",  
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
                    clearInterval(self.compilerSecondsFunctionReference);
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
                    clearInterval(self.compilerSecondsFunctionReference);
                });
            }
        }

        public saveTestScenario() {

            if (this.state() !== "idle") {
                return;
            }

            let data = {
                gherkin: this.sourceCode(),
                name: this.name(),
                description: this.description(),
            };

            let request = $.ajax({
                url: "/api/specs/" + this.specificationId + "/testscenarios/" + this.scenarioId(),  
                data: JSON.stringify(data),
                dataType: "json",
                method: "PUT",
                contentType: "application/json"
            });

            let self = this;

            self.state("Saving test scenario");

            request.fail((response) => {
                self.state("idle");
                if (response.status === 400) {
                    self.handleValidationFormFailed(response.responseJSON);
                    this.BannerText("Error saving test scenario.");
                }
                else {
                    alert("Error saving test scenario");
                }
            });

            request.done((response) => {
                this.savedTestScenarioName(response.name);
                self.initialDescription(response.description);
                self.initialName(response.name);
                self.initialSourceCode(response.gherkin);
                self.successfulValidationSourceCode(response.gherkin);
                this.BannerText("Test scenario: " + response.name +" is saved.");
                this.state("idle"); 
            });
        }

        private handleValidationFormFailed(modelState: IEditTestScenarioModelState) {

            this.resetValidation();

            this.validationLinks([]);

            if (modelState) {

                if (modelState.Name && modelState.Name.length > 0) {
                    this.isNameValid(false);
                    let link = {
                        href: "#field-EditTestScenarioModel-Name",
                        message: modelState.Name[0],
                        id: "validation-link-for-EditTestScenarioModel-Name"
                    }
                    this.validationLinks.push(link);
                }

                if (modelState.Description && modelState.Description.length > 0) {
                    this.isDescriptionValid(false);
                    let link = {
                        href: "#field-EditTestScenarioModel-Description",
                        message: modelState.Description[0],
                        id: "validation-link-for-EditTestScenarioModel-Description"
                    }
                    this.validationLinks.push(link);
                }

                if (modelState.SourceCode && modelState.SourceCode.length > 0) {
                    this.isSourceCodeValid(false);
                    let link = {
                        href: "#field-EditTestScenarioModel-SourceCode",
                        message: modelState.SourceCode[0],
                        id: "validation-link-for-EditTestScenarioModel-SourceCode"
                    }

                    this.validationLinks.push(link);
                }
            }
        }

        public loadIntellisenseContext(specificationId: string) {
            if (this.state() === "idle") {

                if (this.codeContexts[specificationId]) {
                    this.setCodeContext(this.codeContexts[specificationId]);
                }
                else {
                    this.state(this.stateKeyIntellisenseLoading);
                    let request = $.ajax({
                        url: "/api/specs/" + this.specificationId + "/codeContext",
                        dataType: "json",
                        method: "GET",
                        contentType: "application/json"
                    });

                    let self = this;

                    request.fail((error) => {
                        let errorMessage = "Error loading intellisense for specification:\n";
                        errorMessage += "Status: " + error.status;
                        self.testOutput(errorMessage);
                        self.state("idle");
                    });

                    request.done((result: Array<calculateFunding.common.ITypeInformationResponse>) => {

                        let codeContext: ITestScenarioCodeContext = {
                            calculations: [],
                            datasets: [],
                        };

                        let calculationType: common.ITypeInformationResponse = ko.utils.arrayFirst(result, (item: common.ITypeInformationResponse) => {
                            return item.name === "Calculations";
                        });

                        if (calculationType) {

                            for (let m in calculationType.methods) {
                                let currentMethod: calculateFunding.common.IMethodInformationResponse = calculationType.methods[m];

                                if (currentMethod.entityId) {
                                    let functionInformation: calculateFunding.providers.ICalculation = {
                                        name: currentMethod.friendlyName,
                                        description: currentMethod.description,
                                    };
                                    codeContext.calculations.push(functionInformation);
                                }
                            }
                        }

                        let datasetsType: common.ITypeInformationResponse = ko.utils.arrayFirst(result, (item: common.ITypeInformationResponse) => {
                            return item.name === "Datasets";
                        });

                        if (datasetsType) {
                            for (let d in datasetsType.properties) {
                                let datasetProperty: common.IPropertyInformationResponse = datasetsType.properties[d];
                                let dataset: calculateFunding.providers.IDataset = {
                                    name: datasetProperty.friendlyName,
                                    description: datasetProperty.description,
                                    fields: [],
                                };

                                let datasetClassType: common.ITypeInformationResponse = ko.utils.arrayFirst(result, (item: common.ITypeInformationResponse) => {
                                    return item.type === datasetProperty.type;
                                });

                                if (datasetClassType) {
                                    for (let f in datasetClassType.properties) {
                                        let property: common.IPropertyInformationResponse = datasetClassType.properties[f];
                                        dataset.fields.push({
                                            name: property.friendlyName,
                                            fieldName: property.name,
                                            type: property.type,
                                            description: property.description,
                                        });
                                    }
                                }
                                else {
                                    console.error("Unable to find class:", datasetClassType.type);
                                }

                                codeContext.datasets.push(dataset);
                            }
                        }

                        self.setCodeContext(codeContext);
                        self.codeContexts[specificationId] = codeContext;

                        self.state("idle");
                    });
                }
            }
        }

        /* Register types for the monaco editor to support intellisense */
        public registerMonacoProviders(viewModel: EditTestScenarioViewModel) {
            console.log("Registering monaco providers");
            monaco.languages.register({ id: "gherkin" });

            monaco.languages.setMonarchTokensProvider('gherkin', {
                tokenPostfix: ".gherkin",
                tokenizer: {
                    root: [

                        { regex: /^(\s)*Given/, action: { token: "keyword" } },
                        { regex: /^(\s)*When/, action: { token: "keyword" } },
                        { regex: /^(\s)*Then/, action: { token: "keyword" } },
                        { regex: /^(\s)*And/, action: { token: "keyword" } },
                        { regex: /('[a-zA-Z0-9\s--_]+')/, action: { token: "string" } },

                        { regex: /(#).*$/, action: { token: 'comment' } },
                    ]
                }

            });


            monaco.editor.defineTheme('gherkin', {
                base: 'vs',
                inherit: true,
                rules: [
                    //{ token: 'keyword', foreground: '808080' },
                    //{ token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
                    //{ token: 'custom-notice', foreground: 'FFA500' },
                    //{ token: 'custom-date', foreground: '008800' },
                ],
                colors: {
                }
            });


            monaco.languages.setLanguageConfiguration("gherkin", {
                comments: {
                    lineComment: '#'
                },
                indentationRules: {
                    increaseIndentPattern: /^(\s)*(Given|When|Then)/,
                    decreaseIndentPattern: /^(\s)*(Given|When|Then)/,
                }
            });

            monaco.languages.registerCompletionItemProvider('gherkin', viewModel.completionProvider.getCompletionProvider());
        }

        public configureMonacoEditor(editor: monaco.editor.IStandaloneCodeEditor) {
        }

        private setCodeContext(context: ITestScenarioCodeContext) {
            this.completionProvider.setDatasets(context.datasets);
            this.completionProvider.setCalculations(context.calculations);
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

    export interface IEditTestScenarioModelState {
        Name: string[];
        SpecificationId: string;
        Description: string[];
        SourceCode: string[];
    }

    export interface IAuthorReference {
        id: string;
        name: string;
    }

    export interface ILoadedCodeContexts {
        [key: string]: ITestScenarioCodeContext;
    }

    export interface ITestScenarioCodeContext {
        datasets: Array<calculateFunding.providers.IDataset>;
        calculations: Array<calculateFunding.providers.ICalculation>;
    }

    export interface IEditTestScenarioViewModelConstructorParameters {
        name: string;
        description: string;
        sourceCode: string;
        specificationId: string;
        scenarioId: string;
    }
}