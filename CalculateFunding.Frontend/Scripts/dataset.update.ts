namespace calculateFunding.updateDataset {

    export class UpdateDatasetViewModel {
        public comment: KnockoutObservable<string> = ko.observable("");

        public fileName: KnockoutObservable<string> = ko.observable("");

        public description: KnockoutObservable<string> = ko.observable("");

        public isLoadingVisible: KnockoutComputed<boolean>;

        public isFormVisible: KnockoutComputed<boolean>;

        public isValidationSummaryVisible: KnockoutComputed<boolean>;

        public isUploadButtonEnabled: KnockoutComputed<boolean>;

        public state: KnockoutObservable<string> = ko.observable("idle");

        public loadingMessage: KnockoutObservable<string> = ko.observable();

        public isCommentValid: KnockoutObservable<boolean> = ko.observable(true);

        public isDescriptionValid: KnockoutObservable<boolean> = ko.observable(true);

        public isFileNameValid: KnockoutObservable<boolean> = ko.observable(true);

        public validationLinks: KnockoutObservableArray<IValidationLink> = ko.observableArray([]);

        private datasetFile: any = null;

        private datasetId: string;

        constructor(options: IUpdateDatasetViewModelConstructorParameters) {
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

            self.isLoadingVisible = ko.pureComputed(() => {
                return self.state() === "loading";
            });

            self.isFormVisible = ko.pureComputed(() => {
                return self.state() === "idle";
            });

            self.isValidationSummaryVisible = ko.pureComputed(() => {
                return !(this.isFileNameValid() && this.isCommentValid() && this.isDescriptionValid());
            });

            self.isUploadButtonEnabled = ko.computed(() => {

                let isEnabled = self.fileName() && true;

                return isEnabled;
            });
        }

        private resetValidation(): void {
            this.isCommentValid(true);
            this.isDescriptionValid(true);
            this.isFileNameValid(true);
        }

        public fileSelect(): void {
            let file = (<HTMLInputElement>event.target).files[0];
            this.fileName(file.name);
            this.datasetFile = file;
        }

        public saveDataset(): void {
            if (this.state() !== "idle")
                return;

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
                    request.setRequestHeader("x-ms-blob-type", "BlockBlob");
                    request.setRequestHeader("x-ms-meta-dataDefinitionId", response.definitionId);
                    request.setRequestHeader("x-ms-meta-datasetId", response.datasetId);
                    request.setRequestHeader("x-ms-meta-authorName", response.author.name);
                    request.setRequestHeader("x-ms-meta-authorId", response.author.id);
                    request.setRequestHeader("x-ms-meta-filename", response.filename);
                    request.setRequestHeader("x-ms-meta-name", response.name);
                    request.setRequestHeader("x-ms-meta-version", response.version.toString());
                }
            });

            blobRequest.done((blobResponse, msg, xhr) => {
                if (xhr.status === 201) {

                    self.handleBlobUploadSuccess(response.datasetId, response.filename, response.version);
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
                    href: "#field-CreateDatasetViewModel-Comment",
                    message: modelState.Name[0],
                    id: "validation-link-for-CreateDatasetViewModel-Comment"

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

        private handleBlobUploadSuccess(datasetId: string, filename: string, version: number): void {
            let self = this;

            self.loadingMessage("Validating dataset..");

            let data = {
                datasetId: datasetId,
                filename: filename,
                version: version,
                description: self.description(),
                comment: self.comment(),
            };

            let validationRequest = $.ajax({
                url: "/api/datasets/validate-dataset",
                data: JSON.stringify(data),
                dataType: "json",
                method: "POST",
                contentType: "application/json",
            });

            validationRequest.always((res: any, msg: string, xhr: JQueryXHR) => {
                if (xhr.status === 204) {
                    self.handleDatasetValidationSuccess();
                }
                else if (xhr.status === 200 && res.message.length > 0) {
                    self.state("idle");
                    self.handleValidationRequestFailed(res);
                }
                else {
                    self.state("idle");
                    self.handleDatasetValidationFailed();
                }
            });
        }

        private invalidateUpload(): void {
            this.resetValidation();

            this.validationLinks([]);

            this.isFileNameValid(false);
            let link = {
                href: "#field-CreateDatasetViewModel-Filename",
                message: "Check you have the right format and check your internet connectivity",
                id: "validation-link-for-CreateDatasetViewModel-Filename"
            }
            this.validationLinks.push(link);
        }

        private handleValidationRequestFailed(response: IValidateDatasetResponse): void {
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

        private handleBlobUploadFailed(): void {
            this.invalidateUpload();
        }

        private handleDatasetValidationSuccess(): void {
            window.location.href = "/datasets/managedatasets";
        }

        private handleDatasetValidationFailed(): void {
            this.invalidateUpload();
        }

        private ConvertToFriendlySize(num: number): string {
            if (num > 0) {
                if (num < 1024) { return num.toFixed(2) + " Bytes" }
                if (num < 1048576) { return (num / 1024).toFixed(2) + " KB" }
                if (num < 1073741824) { return (num / 1024 / 1024).toFixed(2) + " MB" }
                if (num < 1099511600000) { return (num / 1024 / 1024 / 1024).toFixed(2) + " GB" }

                return (num / 1024 / 1024 / 1024 / 1024).toFixed(2) + " TB";
            }

            return num.toString();
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
}
