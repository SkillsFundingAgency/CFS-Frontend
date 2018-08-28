namespace calculateFunding.createNewDataset {

    export class CreateNewDatasetViewModel {

        public name: KnockoutObservable<string> = ko.observable("");

        public description: KnockoutObservable<string> = ko.observable("");

        public dataDefinitionId: KnockoutObservable<string> = ko.observable("");

        public fileName: KnockoutObservable<string> = ko.observable("");

        public isLoadingVisible: KnockoutComputed<boolean>;

        public isFormVisible: KnockoutComputed<boolean>;

        public isValidationSummaryVisible: KnockoutComputed<boolean>;

        public isInvalidDatasourceSummaryVisible: KnockoutComputed<boolean>;

        public isInvalidSchemaSummaryVisible: KnockoutComputed<boolean>;

        public linkToInvalidatedFile: KnockoutObservable<string> = ko.observable("");

        public isUploadButtonEnabled: KnockoutComputed<boolean>;

        public state: KnockoutObservable<string> = ko.observable("idle");

        public loadingMessage: KnockoutObservable<string> = ko.observable();

        public isDefinitionIdValid: KnockoutObservable<boolean> = ko.observable(true);

        public isNameValid: KnockoutObservable<boolean> = ko.observable(true);

        public isDescriptionValid: KnockoutObservable<boolean> = ko.observable(true);

        public isFileNameValid: KnockoutObservable<boolean> = ko.observable(true);

        public isDataSourceValid: KnockoutObservable<boolean> = ko.observable(true);

        public isUploadedDataSchemaValid: KnockoutObservable<boolean> = ko.observable(true);

        public validationLinks: KnockoutObservableArray<IValidationLink> = ko.observableArray([]);

        private datasetFile: any = null;

        private datasetId: string = "";

        private failedUploadErrorMessage: string = "Check you have the right format and check your internet connectivity";

        private invalidDataSourceFileLayoutMessage: string = "The data source file layout is invalid";

        private ConvertToFriendlySize(num: number) {
            if (num > 0) {
                if (num < 1024) { return [num.toFixed(2) + " Bytes"] }
                if (num < 1048576) { return [(num / 1024).toFixed(2) + " KB"] }
                if (num < 1073741824) { return [(num / 1024 / 1024).toFixed(2) + " MB"] }
                if (num < 1099511600000) { return [(num / 1024 / 1024 / 1024).toFixed(2) + " GB"] }

                return [(num / 1024 / 1024 / 1024 / 1024).toFixed(2) + " TB"]
            }

            return num
        }

        constructor() {
            let self = this;

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

            self.isUploadButtonEnabled = ko.computed(() => {

                let isEnabled = (this.dataDefinitionId().length > 0 &&
                    this.description().length > 0 &&
                    this.name().length > 0 &&
                    this.fileName() &&
                    this.fileName().length > 0);

                return isEnabled;
            });
        }

        private resetValidation() {
            this.isNameValid(true);
            this.isDescriptionValid(true);
            this.isDefinitionIdValid(true);
            this.isFileNameValid(true);
            this.isDataSourceValid(true);
            this.isUploadedDataSchemaValid(true);
        }

        public fileSelect() {
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
                        href: "#field-CreateDatasetViewModel-Filename",
                        message: validationResult.errorMessage,
                        id: "validation-link-for-CreateDatasetViewModel-Filename"
                    }
                    this.validationLinks([]);
                    this.validationLinks.push(link);
                }
            }
        }

        private doFileSelectNameValidation(filename: string): IValidationResult {
            let validExtensions = ["XLSX", "XLS"];
            if (filename && !validExtensions.some((value) => value === filename.split('.').pop().toUpperCase())) {
                return { result: false, errorMessage: "The data source file type is invalid. Check that your file is an xls or xlsx file"};
            };
            return { result: true, errorMessage: undefined }
        }


        public saveDataset() {
            if (this.state() !== "idle")
                return;

            let data = {
                name: this.name(),
                description: this.description(),
                dataDefinitionId: this.dataDefinitionId(),
                filename: this.fileName()
            };

            let request = $.ajax({
                url: "/api/datasets",
                data: JSON.stringify(data),
                dataType: "json",
                method: "POST",
                contentType: "application/json"
            });

            let self = this;

            self.state("loading");

            request.fail((response) => {
                self.state("idle");

                self.handleValidateFormFailed(response.responseJSON);
            });

            request.done((response) => {
                if (response) {
                    self.handleValidateFormSuccess(response);
                }
            });
        }

        private addToRequestHeaderIfNotEmpty(request: any, key: string, value: string): void {
            if (value || value.length !== 0 || value.trim()) {
                request.setRequestHeader(key, value);
            }
        }

        private handleValidateFormSuccess(response: ICreateNewDatasetResponseModel) {
            let self = this;

            let blobRequest = $.ajax({
                url: response.blobUrl,
                data: self.datasetFile,
                processData: false,
                contentType: false,
                method: "PUT",
                xhr: function () {
                    let xhr: XMLHttpRequest = new XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function (evt: any) {
                        if (evt.lengthComputable) {
                            self.loadingMessage(self.ConvertToFriendlySize(evt.loaded) + " / " + self.ConvertToFriendlySize(evt.total));
                        }
                    }, false);
                    return xhr;
                },
                beforeSend: function (request) {
                    self.addToRequestHeaderIfNotEmpty(request, "x-ms-blob-type", "BlockBlob");
                    self.addToRequestHeaderIfNotEmpty(request, "x-ms-meta-dataDefinitionId", response.definitionId);
                    self.addToRequestHeaderIfNotEmpty(request, "x-ms-meta-datasetId", response.datasetId);
                    self.addToRequestHeaderIfNotEmpty(request, "x-ms-meta-authorName", response.author.name);
                    self.addToRequestHeaderIfNotEmpty(request, "x-ms-meta-authorId", response.author.id);
                    self.addToRequestHeaderIfNotEmpty(request, "x-ms-meta-filename", response.filename);
                    self.addToRequestHeaderIfNotEmpty(request, "x-ms-meta-name", response.name);
                    self.addToRequestHeaderIfNotEmpty(request, "x-ms-meta-description", response.description);
                }
            });

            blobRequest.done((blobResponse, msg, xhr) => {
                if (xhr.status === 201) {

                    self.handleBlobUploadSuccess(response.datasetId, response.filename);
                }
            });

            blobRequest.fail(() => {
                self.state("idle");

            });
        }


        private handleValidateFormFailed(modelState: ICreateNewDatasetModelState) {

            this.resetValidation();

            this.validationLinks([]);

            if (modelState.Name && modelState.Name.length > 0) {
                this.isNameValid(false);
                let link = {
                    href: "#field-CreateDatasetViewModel-Name",
                    message: modelState.Name[0],
                    id: "validation-link-for-CreateDatasetViewModel-Name"

                }
                this.validationLinks.push(link);
            }

            if (modelState.Description && modelState.Description.length > 0) {
                this.isDescriptionValid(false);
                let link = {
                    href: "#field-CreateDatasetViewModel-Description",
                    message: modelState.Description[0],
                    id: "validation-link-for-CreateDatasetViewModel-Description"
                }
                this.validationLinks.push(link);
            }

            if (modelState.DefinitionId && modelState.DefinitionId.length > 0) {
                this.isDefinitionIdValid(false);
                let link = {
                    href: "#field-CreateDatasetViewModel-DataDefinitionId",
                    message: modelState.DefinitionId[0],
                    id: "validation-link-for-CreateDatasetViewModel-DataDefinitionId"
                }
                this.validationLinks.push(link);
            }

            if (modelState.Filename && modelState.Filename.length > 0) {
                this.isFileNameValid(false);
                let link = {
                    href: "#field-CreateDatasetViewModel-Filename",
                    message: modelState.Filename[0],
                    id: "validation-link-for-CreateDatasetViewModel-Filename"
                }
                this.validationLinks.push(link);
            }
        }

        private handleBlobUploadSuccess(datasetId: string, filename: string) {
            let self = this;

            self.loadingMessage("Validating data source");

            let data = {
                DatasetId: datasetId,
                Filename: filename,
                Version: 1
            };

            let validationRequest = $.ajax({
                url: "/api/datasets/validate-dataset",
                data: JSON.stringify(data),
                dataType: "json",
                method: "POST",
                contentType: "application/json"
            });

            validationRequest.always((res: any, msg: string, xhr: JQueryXHR) => {
                if (xhr.status === 200) {
                    self.handleDatasetValidationSuccess(datasetId);
                }
                else if (res.status === 400) {
                    self.state("idle");

                    if ('typical-model-validation-error' in res.responseJSON) {
                        let filteredErrors: Array<IModelValidationError> = [];
                        for (var modelState in res.responseJSON) {
                            if (modelState !== "typical-model-validation-error") {
                                filteredErrors.push(({ modelName: modelState, errorMessage: res.responseJSON[modelState] }) as any);
                            }
                        }
                        for (var modelStateIndex in filteredErrors) {
                            let modelState = filteredErrors[modelStateIndex];
                            let link = {
                                href: "#field-CreateDatasetViewModel-" + (modelState.modelName),
                                message: modelState.errorMessage,
                                id: "validation-link-for-CreateDatasetViewModel-" + (modelState.modelName)
                            }
                            this.validationLinks([]);
                            this.validationLinks.push(link);
                        }

                        this.isFileNameValid(false);
                    }
                    else if ('excel-validation-error' in res.responseJSON) {
                        this.linkToInvalidatedFile(res.responseJSON.blobUrl);
                        this.isUploadedDataSchemaValid(false);
                        return;
                    }
                    else {
                        self.handleDatasetValidationFailed(self.invalidDataSourceFileLayoutMessage);
                    }
                }
                else {
                    self.state("idle");
                    self.handleDatasetValidationFailed(self.failedUploadErrorMessage);
                }
            });
        }

        private invalidateUpload(message: string = "", displayInvalidDatasourceSummary: boolean = false) {
            this.resetValidation();

            this.validationLinks([]);
            if (displayInvalidDatasourceSummary) {
                this.isDataSourceValid(false);
            }

            this.isFileNameValid(false);
            let link = {
                href: "#field-CreateDatasetViewModel-Filename",
                message: message,
                id: "validation-link-for-CreateDatasetViewModel-Filename"
            }
            this.validationLinks.push(link);
        }

        private handleValidationRequestFailed(response: IValidateDatasetResponse) {
            this.resetValidation();

            this.validationLinks([]);

            this.isFileNameValid(false);

            let link = {
                href: response.fileUrl,
                message: response.message,
                id: "validation-link-for-CreateDatasetViewModel-Filename"
            }
            this.validationLinks.push(link);
        }

        private handleBlobUploadFailed() {
            this.invalidateUpload(this.failedUploadErrorMessage);
        }

        private handleDatasetValidationSuccess(datasetId: string) {
            window.location.href = "/datasets/managedatasets?operationType=DatasetCreated&operationId=" + datasetId;
        }

        private handleDatasetValidationFailed(message: string) {
            this.invalidateUpload(message, true);
        }

    }

    export interface ICreateNewDatasetResponseModel {
        blobUrl: string;
        definitionId: string;
        datasetId: string;
        author: IAuthorReference;
        name: string;
        description: string;
        filename: string
    }

    export interface IAuthorReference {
        id: string;
        name: string;
    }

    export interface IValidationLink {
        href: string;
        message: string;
        id: string;
    }

    export interface ICreateNewDatasetModelState {
        Name: string[];
        Filename: string[];
        Description: string[];
        DefinitionId: string[];
    }

    export interface IValidateDatasetResponse {
        message: string;
        fileUrl: string;
    }

    export interface IValidationResult {
        result: boolean;
        errorMessage: string;
    }

    export interface IModelValidationError {
        modelName: string;
        errorMessage: string;
    }
}
