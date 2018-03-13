namespace calculateFunding.createNewDataset {

    export class CreateNewDatasetViewModel {

        public name: KnockoutObservable<string> = ko.observable("");

        public description: KnockoutObservable<string> = ko.observable("");

        public dataDefinitionId: KnockoutObservable<string> = ko.observable("");

        public fileName: KnockoutObservable<string> = ko.observable("");

        public isLoadingVisible: KnockoutComputed<boolean>;

        public isFormVisible: KnockoutComputed<boolean>;

        public isValidationSummaryVisible: KnockoutComputed<boolean>;

        public isUploadButtonEnabled: KnockoutComputed<boolean>;

        public state: KnockoutObservable<string> = ko.observable("idle");

        public loadingMessage: KnockoutObservable<string> = ko.observable();

        public isDefinitionIdValid: KnockoutObservable<boolean> = ko.observable(true);

        public isNameValid: KnockoutObservable<boolean> = ko.observable(true);

        public isDescriptionValid: KnockoutObservable<boolean> = ko.observable(true);

        public isFileNameValid: KnockoutObservable<boolean> = ko.observable(true);

        public validationLinks: KnockoutObservableArray<IValidationLink> = ko.observableArray([]);

        private datasetFile: any = null;

        private datasetId: string = "";

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

            self.isUploadButtonEnabled = ko.computed(() => {

                let isEnabled = (this.dataDefinitionId().length > 0
                    && this.description().length > 0
                    && this.name().length > 0 &&
                    this.fileName().length > 0);

                return isEnabled;
            });
        }

        private resetValidation() {
            this.isNameValid(true);
            this.isDescriptionValid(true);
            this.isDefinitionIdValid(true);
            this.isFileNameValid(true);
        }

        public fileSelect() {
            let file = (<HTMLInputElement>event.target).files[0];
            this.fileName(file.name);
            this.datasetFile = file;
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
                    request.setRequestHeader("x-ms-blob-type", "BlockBlob");
                    request.setRequestHeader("x-ms-meta-dataDefinitionId", response.definitionId);
                    request.setRequestHeader("x-ms-meta-datasetId", response.datasetId);
                    request.setRequestHeader("x-ms-meta-authorName", response.author.name);
                    request.setRequestHeader("x-ms-meta-authorId", response.author.id);
                    request.setRequestHeader("x-ms-meta-filename", response.filename);
                    request.setRequestHeader("x-ms-meta-name", response.name);
                    request.setRequestHeader("x-ms-meta-description", response.description);
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

            self.loadingMessage("Validating dataset..");

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

        private invalidateUpload() {
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
            this.invalidateUpload();
        }

        private handleDatasetValidationSuccess() {
            window.location.href = "/datasets/managedatasets";
        }

        private handleDatasetValidationFailed() {
            this.invalidateUpload();
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
}
