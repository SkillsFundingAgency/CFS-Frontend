namespace calculateFunding.datasets {
    export abstract class DatasetCommonViewModel {
        public state: KnockoutObservable<string> = ko.observable("idle");

        public description: KnockoutObservable<string> = ko.observable("");

        public fileName: KnockoutObservable<string> = ko.observable("");

        public isLoadingVisible: KnockoutComputed<boolean>;

        public loadingMessage: KnockoutObservable<string> = ko.observable();

        public validationLinks: KnockoutObservableArray<IValidationLink> = ko.observableArray([]);

        public isNameValid: KnockoutObservable<boolean> = ko.observable(true);

        public isDescriptionValid: KnockoutObservable<boolean> = ko.observable(true);

        public isFileNameValid: KnockoutObservable<boolean> = ko.observable(true);

        public isDataSourceValid: KnockoutObservable<boolean> = ko.observable(true);

        public isUploadedDataSchemaValid: KnockoutObservable<boolean> = ko.observable(true);

        public isFormVisible: KnockoutComputed<boolean>;

        public isValidationSummaryVisible: KnockoutComputed<boolean>;

        public isInvalidDatasourceSummaryVisible: KnockoutComputed<boolean>;

        public isInvalidSchemaSummaryVisible: KnockoutComputed<boolean>;

        public isUploadButtonEnabled: KnockoutComputed<boolean>;

        public isDefinitionIdValid: KnockoutObservable<boolean> = ko.observable(true);

        public linkToInvalidatedFile: KnockoutObservable<string> = ko.observable("");

        protected validateOperationId: string;

        private failedUploadErrorMessage: string = "Check you have the right format and check your internet connectivity";

        private invalidDataSourceFileLayoutMessage: string = "The data source file layout is invalid";

        protected datasetFile: any = null;

        private aspViewModelName: string;

        constructor(aspViewModelName: string) {
            let self = this;

            this.aspViewModelName = aspViewModelName;

            self.isLoadingVisible = ko.pureComputed(() => {
                return self.state() === "loading";
            });

            self.isFormVisible = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            self.isValidationSummaryVisible = ko.pureComputed(() => {
                return !(this.isFileNameValid() && this.isDefinitionIdValid() && this.isNameValid() && this.isDefinitionIdValid());
            });

            self.isInvalidDatasourceSummaryVisible = ko.computed(() => {
                return !self.isDataSourceValid();
            });

            self.isInvalidSchemaSummaryVisible = ko.computed(() => {
                return !this.isUploadedDataSchemaValid();
            });
        }

        public fileSelect(): void {
            let file = (<HTMLInputElement>event.target).files[0];
            if (file && file.name) {
                let validationResult = this.doFileSelectNameValidation(file.name);
                if (validationResult.result) {
                    this.fileName(file.name);
                    this.datasetFile = file;
                    this.isFileNameValid(true);
                    this.isUploadedDataSchemaValid(true);
                } else {
                    this.fileName(null);
                    this.datasetFile = null;
                    this.isFileNameValid(false);
                    let link = {
                        href: "#field-" + this.aspViewModelName + "-Filename",
                        message: validationResult.errorMessage,
                        id: "validation-link-for-" + this.aspViewModelName + "-Filename"
                    }
                    this.validationLinks([]);
                    this.validationLinks.push(link);
                }
            }
        }

        private doFileSelectNameValidation(filename: string): IValidationResult {
            let validExtensions = ["XLSX", "XLS"];
            if (filename && !validExtensions.some((value) => value === filename.split('.').pop().toUpperCase())) {
                return { result: false, errorMessage: "The data source file type is invalid. Check that your file is an xls or xlsx file" };
            };
            return { result: true, errorMessage: undefined }
        }

        protected handleBlobUploadSuccess(data: Object) {
            let self = this;

            self.loadingMessage("Validating data source");


            let validationRequest = $.ajax({
                url: "/api/datasets/validate-dataset",
                data: JSON.stringify(data),
                dataType: "json",
                method: "POST",
                contentType: "application/json"
            });

            validationRequest.always((res: any, msg: string, xhr: JQueryXHR) => {
                if (xhr.status === 200) {
                    self.validateOperationId = res.operationId;
                    self.checkValidateStatus();
                }
                else if (res.status === 400) {
                    self.handleDatasetValidationFailure(res);
                }
                else {
                    self.state("idle");
                    self.handleDatasetValidationFailed(self.failedUploadErrorMessage);
                }
            });
        }


        protected handleDatasetValidationFailure(res: any) {
            this.state("idle");

            if (!res) {
                alert("Invalid response from server, returned null");
                return;
            }

            let validationResult: { [key: string]: string } = null;
            if (typeof res.validationFailures !== "undefined") {
                validationResult = res.validationFailures;
            }
            else if (typeof res.responseJSON !== "undefined") {
                validationResult = res.responseJSON;
            }
            if (validationResult && "excel-validation-error" in validationResult) {
                this.linkToInvalidatedFile(validationResult.blobUrl[0]);
                this.isUploadedDataSchemaValid(false);
                return;
            }
            else if (validationResult && $.isPlainObject(validationResult)) {
                let filteredErrors: Array<IModelValidationError> = [];
                for (let modelState in validationResult) {
                    if (modelState !== "typical-model-validation-error") {
                        filteredErrors.push(({ modelName: modelState, errorMessage: validationResult[modelState] }) as any);
                    }
                }
                for (let modelStateIndex in filteredErrors) {
                    let modelState = filteredErrors[modelStateIndex];
                    let link = {
                        href: "#field-" + this.aspViewModelName + "-" + (modelState.modelName),
                        message: modelState.errorMessage,
                        id: "validation-link-for-" + this.aspViewModelName + "-" + (modelState.modelName)
                    }
                    this.validationLinks([]);
                    this.validationLinks.push(link);
                }

                this.isFileNameValid(false);
            }

            else {
                this.handleDatasetValidationFailed(this.invalidDataSourceFileLayoutMessage);
            }
        }

        private checkValidateStatus() {
            let self = this;

            self.state("loading");

            if (self.validateOperationId) {

                let statusRequest = $.ajax({
                    url: "/api/dataset-validate-status/" + self.validateOperationId,
                    dataType: "json",
                    method: "GET",
                    contentType: "application/json"
                });

                statusRequest.done((res) => {
                    let result: IDatasetValidateStatusResponse = res;
                    if (result.currentOperation === "Validated") {
                        self.handleDatasetValidationSuccess(result.datasetId);
                        return;
                    }
                    else if (result.currentOperation === "FailedValidation") {
                        self.handleDatasetValidationFailure(res);
                        return;
                    }
                    else {
                        let message: string = ValidationStates[result.currentOperation];
                        if (!message) {
                            message = "Unknown state: " + result.currentOperation;
                        }

                        self.loadingMessage(message);
                    }

                    setTimeout(function () { self.checkValidateStatus(); }, 2500);
                });

                statusRequest.fail(() => {
                    setTimeout(function () { self.checkValidateStatus(); }, 2500);
                });
            }
            else {
                alert("Unable to locate dataset validate operationId");
            }

        }

        protected invalidateUpload(message: string = "", displayInvalidDatasourceSummary: boolean = false) {
            this.resetValidation();

            this.validationLinks([]);
            if (displayInvalidDatasourceSummary) {
                this.isDataSourceValid(false);
            }

            this.isFileNameValid(false);
            let link = {
                href: "#field-" + this.aspViewModelName + "-Filename",
                message: message,
                id: "validation-link-for-" + this.aspViewModelName + "-Filename"
            }
            this.validationLinks.push(link);
        }

        protected handleBlobUploadFailed() {
            this.invalidateUpload(this.failedUploadErrorMessage);
        }

        protected handleDatasetValidationFailed(message: string) {
            this.invalidateUpload(message, true);
        }

        protected ConvertToFriendlySize(num: number): string {
            if (num > 0) {
                if (num < 1024) { return num.toFixed(2) + " Bytes" }
                if (num < 1048576) { return (num / 1024).toFixed(2) + " KB" }
                if (num < 1073741824) { return (num / 1024 / 1024).toFixed(2) + " MB" }
                if (num < 1099511600000) { return (num / 1024 / 1024 / 1024).toFixed(2) + " GB" }

                return (num / 1024 / 1024 / 1024 / 1024).toFixed(2) + " TB";
            }

            return num.toString();
        }

        protected abstract handleDatasetValidationSuccess(datasetId: string): void;

        protected abstract resetValidation(): void;

    }

    export interface IModelValidationError {
        modelName: string;
        errorMessage: string;
    }

    export interface IDatasetValidateStatusResponse {
        operationId: string;
        currentOperation: string;
        errorMessage: string;
        lastUpdated: Date;
        lastUpdatedFormatted: string;
        datasetId: string;
        validationFailures: { [key: string]: string[] };
    }

    export interface IValidationLink {
        href: string;
        message: string;
        id: string;
    }

    export interface IValidationResult {
        result: boolean;
        errorMessage: string;
    }

    export let ValidationStates: { [state: string]: string } = {
        "Queued": "Queued for processing",
        "Processing": "Processing and prevalidation checks",
        "ValidatingExcelWorkbook": "Validating Excel Workbook",
        "ValidatingTableResults": "Validating data and providers",
        "SavingResults": "Saving results",
        "FailedValidation": "Validation failed",
        "ExceptionThrown": "Internal server error",
        "Validated": "Validated",
    };
}