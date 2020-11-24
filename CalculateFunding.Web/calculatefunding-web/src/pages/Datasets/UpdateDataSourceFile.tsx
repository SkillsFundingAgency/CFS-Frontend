import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {DatasetVersionHistoryViewModel, Result} from "../../types/Datasets/DatasetVersionHistoryViewModel";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getCurrentDatasetVersionByDatasetId, getDatasetHistoryService, getDatasetValidateStatusService, updateDatasetService, uploadDatasetVersionService, validateDatasetService} from "../../services/datasetService";
import {DateFormatter} from "../../components/DateFormatter";
import {DatasetValidateStatusResponse, UpdateNewDatasetVersionResponseViewModel, ValidationStates} from "../../types/Datasets/UpdateDatasetRequestViewModel";
import {Footer} from "../../components/Footer";
import {UpdateStatus} from "../../types/Datasets/UpdateStatus";
import {MergeSummary} from "./MergeSummary/MergeSummary";
import {MergeMatch} from "./MergeSummary/MergeMatch";
import {MergeDatasetViewModel} from "../../types/Datasets/MergeDatasetViewModel";

export interface UpdateDataSourceFileRouteProps {
    fundingStreamId: string;
    datasetId: string;
}

export function UpdateDataSourceFile({match}: RouteComponentProps<UpdateDataSourceFileRouteProps>) {
    const [dataset, setDataset] = useState<Result>({
        id: "",
        blobName: "",
        changeNote: "",
        datasetId: "",
        definitionName: "",
        description: "",
        lastUpdatedByName: "",
        lastUpdatedDate: new Date(),
        name: "",
        version: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [updateType, setUpdateType] = useState<string>("");
    const [uploadFileName, setUploadFileName] = useState<string>("");
    const [uploadFile, setUploadFile] = useState<File>();
    const [uploadFileExtension, setUploadFileExtension] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [changeNote, setChangeNote] = useState<string>("");
    const [loadingStatus, setLoadingStatus] = useState<string>("Update data source");
    const [validationFailures, setValidationFailures] = useState<{ [key: string]: string[] }>();
    const validExtensions = [".csv", ".xls", ".xlsx"];
    const [validation, setValidation] = useState({
        fileValid: true,
        changeNoteValid: true,
        updateTypeValid: true
    });
    const [mergeResults, setMergeResults] = useState<MergeDatasetViewModel>();
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(UpdateStatus.Unset);

    useEffectOnce(() => {
        setIsLoading(true);
        getDatasetHistoryService(match.params.datasetId, 1, 1).then((result) => {
            const response = result.data as DatasetVersionHistoryViewModel;
            setDataset(response.results[0]);
            setDescription(response.results[0].description);
            setChangeNote(response.results[0].changeNote);
        }).finally(() => {
            setIsLoading(false);
        });
    });

    function submitDataSourceFile() {

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        updateDatasetService(match.params.fundingStreamId, match.params.datasetId, uploadFileName).then((result) => {
            if (result.status === 200 || result.status === 201) {
                const newDataset = result.data as UpdateNewDatasetVersionResponseViewModel;
                newDataset.mergeExisting = updateType === "merge";
                uploadFileToServer(newDataset);
            } else {
                setValidationFailures({"error-message": ["Unable to update data source"]});
                setIsLoading(false);
            }
        }).catch(() => {
            setValidationFailures({"error-message": ["Unable to update data source"]});
            setIsLoading(false);
        });
    }

    function uploadFileToServer(request: UpdateNewDatasetVersionResponseViewModel) {
        if (uploadFile !== undefined) {
            uploadDatasetVersionService(
                request,
                uploadFile
            )
                .then((uploadDatasetVersionResponse) => {
                    if (uploadDatasetVersionResponse.status === 200 || uploadDatasetVersionResponse.status === 201) {
                        validateDatasetService(
                            request.datasetId,
                            request.fundingStreamId,
                            request.filename,
                            request.version.toString(),
                            request.mergeExisting,
                            description,
                            changeNote).then((validateDatasetResponse) => {
                            if (validateDatasetResponse.status === 200 || validateDatasetResponse.status === 201) {
                                const validateOperationId: any = validateDatasetResponse.data.operationId;
                                if (!validateOperationId) {
                                    setValidationFailures({"error-message": ["Unable to locate dataset validate operationId"]});
                                    setIsLoading(false);
                                    return;
                                }
                                getDatasetValidateStatus(validateOperationId)
                                setIsLoading(false);
                            } else {
                                setValidationFailures({"error-message": ["Unable to validate dataset"]});
                                setIsLoading(false);
                                return;
                            }
                        }).catch(() => {
                            setValidationFailures({"error-message": ["Unable to validate dataset"]});
                            setIsLoading(false);
                        })
                    } else {
                        setValidationFailures({"error-message": ["Unable to upload file"]});
                        setIsLoading(false);
                        return;
                    }
                })
        } else {
            setIsLoading(false);
            return;
        }
    }

    function getDatasetValidateStatus(operationId: string) {
        getDatasetValidateStatusService(operationId).then((datasetValidateStatusResponse) => {
            if (datasetValidateStatusResponse.status === 200 || datasetValidateStatusResponse.status === 201) {
                const result: DatasetValidateStatusResponse = datasetValidateStatusResponse.data;
                if (result.currentOperation === "Validated") {
                    getCurrentDatasetVersionByDatasetId(match.params.datasetId).then
                    ((response) => {
                            const mergeDatasetResult = response.data as MergeDatasetViewModel;

                            if (mergeDatasetResult.amendedRowCount === 0 && mergeDatasetResult.newRowCount === 0) {
                                setUpdateStatus(UpdateStatus.Matched)
                            } else {
                                setUpdateStatus(UpdateStatus.Successful);
                            }

                            setMergeResults(mergeDatasetResult);
                        }
                    );
                    return;
                } else if (result.currentOperation === "FailedValidation") {
                    setValidationFailures(result.validationFailures);
                    setIsLoading(false);
                    return;
                } else {
                    let message: string = ValidationStates[result.currentOperation];
                    if (!message) {
                        message = "Unknown state: " + result.currentOperation;
                    }
                    setLoadingStatus(message);
                }
            } else {
                setValidationFailures({"error-message": ["Unable to get dataset validation status"]});
                setIsLoading(false);
                return;
            }

            setTimeout(function () {
                getDatasetValidateStatus(operationId);
            }, 2500);

        }).catch(() => {
            setValidationFailures({"error-message": ["Unable to get dataset validation status"]});
            setIsLoading(false);
        });
    }

    function validateForm() {
        setValidation(prevState => {
            return {
                ...prevState,
                changeNoteValid: true,
                fileValid: true
            }
        });
        setValidationFailures(undefined);

        let isValid = true;

        if (uploadFile === undefined) {
            setValidation(prevState => {
                return {
                    ...prevState,
                    fileValid: false
                }
            });

            isValid = false;
        } else {
            if (validExtensions.indexOf(uploadFileExtension) < 0) {
                setValidation(prevState => {
                    return {
                        ...prevState,
                        fileValid: false
                    }
                });
                isValid = false;
            }
        }

        if (changeNote === "") {
            setValidation(prevState => {
                return {
                    ...prevState,
                    changeNoteValid: false
                }
            });
            isValid = false;
        }

        if (updateType === "") {
            setValidation(prevState => {
                return {
                    ...prevState,
                    updateTypeValid: false
                }
            })
        }

        return isValid;
    }

    function storeFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files != null) {
            const file: File = e.target.files[0];
            if (file != null) {
                setUploadFileName(file.name);
                setUploadFile(file);
                setUploadFileExtension(file.name.substring(file.name.lastIndexOf('.')).toLowerCase());
            }
        }
    }

    return <div>
        <Header location={Section.Datasets}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"}/>
                <Breadcrumb name={"Manage data source files"} url={"/Datasets/ManageDataSourceFiles"}/>
                <Breadcrumb name="Update data source file"/>
            </Breadcrumbs>
            <LoadingStatus title={loadingStatus} hidden={!isLoading}
                           subTitle={"Please wait whilst the data source is updated"}/>
            <div hidden={((validation.changeNoteValid && validation.fileValid && validationFailures === undefined) || isLoading)}
                 className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert"
                 data-module="govuk-error-summary">
                <h2 className="govuk-error-summary__title">
                    There is a problem
                </h2>
                <div className="govuk-error-summary__body">
                    <ul id="error-summary-list" className="govuk-list govuk-error-summary__list">
                        {
                            (!validation.fileValid) ?
                                <li><a href={"#select-data-source"}>Upload a xls or xlsx file</a></li>
                                : ""
                        }
                        {
                            (validationFailures !== undefined && validationFailures["error-message"] != null) ?
                                <li>{validationFailures["error-message"]}</li>
                                : ""
                        }
                        {
                            (validationFailures !== undefined && validationFailures["FundingStreamId"] != null) ?
                                <li>{validationFailures["FundingStreamId"]}</li>
                                : ""
                        }
                        {
                            (validationFailures !== undefined && validationFailures["blobUrl"] != null) ?
                                <li><span> please see </span><a href={validationFailures["blobUrl"].toString()}>error report</a></li>
                                : ""
                        }
                        {
                            (!validation.changeNoteValid) ?
                                <li><a href={"#change-note"}>Enter change note</a></li>
                                : ""
                        }
                        {
                            (!validation.updateTypeValid) ?
                                <li><a href={"#update-type"}>Select update type</a></li>
                                : ""
                        }
                    </ul>
                </div>
            </div>
            <fieldset className="govuk-fieldset" hidden={isLoading || updateStatus !== UpdateStatus.Unset}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h1 className="govuk-fieldset__heading govuk-!-margin-bottom-5">
                        Update data source
                    </h1>
                </legend>
                <details className="govuk-details" data-module="govuk-details">
                    <summary className="govuk-details__summary">
                <span id={"summary-text"} className="govuk-details__summary-text">
                    {dataset.name} (version {dataset.version})
                </span>
                    </summary>
                    <div id={"last-updated-by-author"} className="govuk-details__text">
                        {dataset.lastUpdatedByName} <span className="govuk-!-margin-left-2"><DateFormatter utc={false} date={dataset.lastUpdatedDate}/></span>
                    </div>
                </details>
                <div id="update-type"
                     className={"govuk-form-group" + (validationFailures !== undefined || !validation.updateTypeValid ? " govuk-form-group--error" : "")}>
                    <div className="govuk-radios">
                        <label className="govuk-label" htmlFor="update-type-radios">
                            Select update type
                        </label>
                        <div className="govuk-radios__item">
                            <input className="govuk-radios__input" id="update-type-merge" name="update-type" type="radio" value="merge" onClick={(e) => setUpdateType(e.currentTarget.value)}/>
                            <label className="govuk-label govuk-radios__label" htmlFor="update-type-merge">
                                Merge existing version
                            </label>
                            <div id="update-type-merge-hint" className="govuk-hint govuk-radios__hint">
                                Combine a new data source with the existing file
                            </div>
                        </div>
                        <div className="govuk-radios__item">
                            <input className="govuk-radios__input" id="update-type-new" name="update-type" type="radio" value="new" onClick={(e) => setUpdateType(e.currentTarget.value)}/>
                            <label className="govuk-label govuk-radios__label" htmlFor="update-type-new">
                                Create new version
                            </label>
                            <div id="update-type-new-hint" className="govuk-hint govuk-radios__hint">
                                Replace the existing data source with a new file
                            </div>
                        </div>
                    </div>
                </div>
                <div id="select-data-source"
                     className={"govuk-form-group" + (validationFailures !== undefined || !validation.fileValid ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="file-upload-data-source">
                        Select data source file
                    </label>
                    {
                        (validationFailures !== undefined || !validation.fileValid) ?
                            <span id="data-source-error-message" className="govuk-error-message">
                                <span className="govuk-visually-hidden">Error:</span>
                                {
                                    (!validation.fileValid) ?
                                        "Upload a xls or xlsx file"
                                        : ""
                                }
                                {
                                    (validationFailures !== undefined && validationFailures["error-message"] != null) ?
                                        validationFailures["error-message"]
                                        : ""
                                }
                                {
                                    (validationFailures !== undefined && validationFailures["FundingStreamId"] != null) ?
                                        validationFailures["FundingStreamId"]
                                        : ""
                                }
                                {
                                    (validationFailures !== undefined && validationFailures["blobUrl"] != null) ?
                                        <span><span> please see </span><a href={validationFailures["blobUrl"].toString()}>error report</a></span>
                                        : ""
                                }
                            </span>
                            : ""
                    }
                    <input className={"govuk-file-upload" + (validationFailures !== undefined && validationFailures["error-message"] !== undefined ? " govuk-file-upload--error" : "")}
                           id="file-upload-data-source" name="file-upload-data-source" type="file" onChange={(e) => storeFileUpload(e)}
                           accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"/>
                </div>

                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="more-detail">
                        Description
                    </label>
                    <span className="govuk-hint">

                    </span>
                    <textarea className="govuk-textarea" rows={5}
                              aria-describedby="more-detail-hint" value={description}
                              onChange={(e) => setDescription(e.target.value)}>
                    </textarea>
                </div>

                <div id="change-note" className={"govuk-form-group" + (!validation.changeNoteValid ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="more-detail">
                        Change note
                    </label>
                    <span className="govuk-hint">

                    </span>
                    {
                        (!validation.changeNoteValid) ?
                            <span className="govuk-error-message">
                                <span className="govuk-visually-hidden">Error:</span>
                                Enter change note
                            </span>
                            : ""
                    }
                    <textarea className={"govuk-textarea" + (!validation.changeNoteValid ? " govuk-textarea--error" : "")}
                              rows={5}
                              aria-describedby="more-detail-hint" value={changeNote}
                              onChange={(e) => setChangeNote(e.target.value)}>
                    </textarea>
                </div>

                <button id={"submit-datasource-file"} className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                        onClick={submitDataSourceFile}>
                    Save
                </button>
                <Link id={"cancel-datasource-link"} to={`/Datasets/ManageData`} className="govuk-button govuk-button--secondary"
                      data-module="govuk-button">
                    Cancel
                </Link>
            </fieldset>
            {(mergeResults !== undefined) ?
                <>
                    <MergeSummary additionalRowsCreated={mergeResults.newRowCount}
                                dataSchemaName={dataset.definitionName}
                                dataSource={mergeResults.name}
                                dataSourceVersion={mergeResults.version}
                                existingRowsAmended={mergeResults.amendedRowCount}
                                hidden={updateStatus !== UpdateStatus.Successful}
                />
                    <MergeMatch additionalRowsCreated={mergeResults.newRowCount}
                                dataSchemaName={dataset.definitionName}
                                dataSource={mergeResults.name}
                                dataSourceVersion={mergeResults.version}
                                existingRowsAmended={mergeResults.amendedRowCount}
                                hidden={updateStatus !== UpdateStatus.Matched}
                    />
                    </>
                : ""
            }
        </div>
        <Footer/>
    </div>
}
