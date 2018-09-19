/// <reference path="dataset.common.ts" />

namespace calculateFunding.createNewDataset {

    export class CreateNewDatasetViewModel extends calculateFunding.datasets.DatasetCommonViewModel {

        public name: KnockoutObservable<string> = ko.observable("");

        public dataDefinitionId: KnockoutObservable<string> = ko.observable("");

        constructor() {
            super("CreateDatasetViewModel");
            let self = this;


            self.isUploadButtonEnabled = ko.computed(() => {

                let isEnabled = (this.dataDefinitionId().length > 0 &&
                    this.description().length > 0 &&
                    this.name().length > 0 &&
                    this.fileName() &&
                    this.fileName().length > 0);

                return isEnabled;
            });
        }

        protected resetValidation() {
            this.isNameValid(true);
            this.isDescriptionValid(true);
            this.isDefinitionIdValid(true);
            this.isFileNameValid(true);
            this.isDataSourceValid(true);
            this.isUploadedDataSchemaValid(true);
        }

        public saveDataset() {
            if (this.state() !== "idle")
                return;

            this.resetValidation();

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
                    let data = {
                        DatasetId: response.datasetId,
                        Filename: response.filename,
                        Version: 1,
                    };

                    self.handleBlobUploadSuccess(data);
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

        protected handleDatasetValidationSuccess(datasetId: string) {
            window.location.href = "/datasets/managedatasets?operationType=DatasetCreated&operationId=" + datasetId;
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

    
}
