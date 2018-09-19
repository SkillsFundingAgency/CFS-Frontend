/// <reference path="dataset.common.ts" />

namespace calculateFunding.updateDataset {

    export class UpdateDatasetViewModel extends calculateFunding.datasets.DatasetCommonViewModel {
        public comment: KnockoutObservable<string> = ko.observable("");

        public isCommentValid: KnockoutObservable<boolean> = ko.observable(true);

        private datasetId: string;

        constructor(options: IUpdateDatasetViewModelConstructorParameters) {
            super("UpdateDatasetViewModel");
            let self = this;

            if (typeof options === "undefined") {
                throw new Error("Options is not defined");
            }

            if (options === null) {
                throw new Error("options is null");
            }

            if (typeof options.datasetId === "undefined") {
                throw new Error("datasetId has not been set");
            }

            if (!options.datasetId) {
                throw new Error("datasetId is null");
            }

            if (typeof options.datasetId !== "undefined") {
                this.description(options.description);
            }

            this.datasetId = options.datasetId;

            self.isUploadButtonEnabled = ko.computed(() => {

                let isEnabled = self.fileName() && true;

                return isEnabled;
            });
        }

        protected resetValidation(): void {
            this.isCommentValid(true);
            this.isDescriptionValid(true);
            this.isFileNameValid(true);
            this.isDataSourceValid(true);
            this.isUploadedDataSchemaValid(true);
        }

        public saveDataset(): void {
            if (this.state() !== "idle")
                return;

            this.resetValidation();

            let data = {
                filename: this.fileName(),
            };

            let request = $.ajax({
                url: "/api/datasets/" + this.datasetId,
                data: JSON.stringify(data),
                dataType: "json",
                method: "PUT",
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

        private handleValidateFormSuccess(response: INewDatasetVersionResponseModel): void {
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
                    self.addToRequestHeaderIfNotEmpty(request, "x-ms-meta-version", response.version.toString());
                }
            });

            blobRequest.done((blobResponse, msg, xhr) => {
                if (xhr.status === 201) {

                    let data = {
                        datasetId: response.datasetId,
                        filename: response.filename,
                        version: response.version,
                        description: self.description(),
                        comment: self.comment(),
                    };

                    self.handleBlobUploadSuccess(data);
                }
            });

            blobRequest.fail(() => {
                self.state("idle");
            });
        }

        private handleValidateFormFailed(modelState: ICreateNewDatasetModelState): void {

            this.resetValidation();

            this.validationLinks([]);

            if (modelState.Name && modelState.Name.length > 0) {
                this.isCommentValid(false);
                let link = {
                    href: "#field-Comment",
                    message: modelState.Name[0],
                    id: "validation-link-for-Comment"

                }
                this.validationLinks.push(link);
            }

            if (modelState.Description && modelState.Description.length > 0) {
                this.isDescriptionValid(false);
                let link = {
                    href: "#field-UpdateDatasetViewModel-Description",
                    message: modelState.Description[0],
                    id: "validation-link-for-UpdateDatasetViewModel-Description"
                }
                this.validationLinks.push(link);
            }

            if (modelState.Filename && modelState.Filename.length > 0) {
                this.isFileNameValid(false);
                let link = {
                    href: "#field-UpdateDatasetViewModel-Filename",
                    message: modelState.Filename[0],
                    id: "validation-link-for-UpdateDatasetViewModel-Filename"
                }
                this.validationLinks.push(link);
            }
        }

        protected handleValidationRequestFailed(response: IValidateDatasetResponse): void {
            this.resetValidation();

            this.validationLinks([]);

            this.isFileNameValid(false);
            let link = {
                href: response.fileUrl,
                message: response.message,
                id: "validation-link-for-UpdateDatasetViewModel-Filename"
            }
            this.validationLinks.push(link);
        }

        protected handleDatasetValidationSuccess(datasetId: string): void {
            window.location.href = "/datasets/managedatasets?operationType=DatasetUpdated&operationId="+datasetId;
        }
    }

    export interface IUpdateDatasetViewModelConstructorParameters {
        datasetId: string;
        description: string;
    }

    export interface INewDatasetVersionResponseModel {
        blobUrl: string;
        definitionId: string;
        datasetId: string;
        author: IAuthorReference;
        name: string;
        description: string;
        filename: string;
        version: number;
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


    export interface IModelValidationError {
        modelName: string;
        errorMessage: string;
    }
}
