import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {DatasetVersionHistoryViewModel, Result} from "../../types/Datasets/DatasetVersionHistoryViewModel";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {
    getDatasetHistoryService, getDatasetValidateStatusService,
    updateDatasetService,
    uploadDatasetVersionService,
    validateDatasetService
} from "../../services/datasetService";
import {DateFormatter} from "../../components/DateFormatter";
import {
    DatasetValidateStatusResponse, UpdateNewDatasetVersionResponseViewModel,
    ValidationStates
} from "../../types/Datasets/UpdateDatasetRequestViewModel";
export interface UpdateDataSourceFileRouteProps {
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
        changeNoteValid: true
    });
    let history = useHistory();

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

        if (!validateForm())
        {
            return;
        }

        setIsLoading(true);

        updateDatasetService(match.params.datasetId, uploadFileName).then((result) => {
            if (result.status === 200 || result.status === 201) {
                const newDataset = result.data as UpdateNewDatasetVersionResponseViewModel;
                uploadFileToServer(newDataset);
            }
            else
            {
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
                request.blobUrl,
                uploadFile,
                request.datasetId,
                request.fundingStreamId,
                request.author.name,
                request.author.id,
                request.definitionId,
                request.name,
                request.version.toString())
                .then((uploadDatasetVersionResponse) => {
                    if (uploadDatasetVersionResponse.status === 200 || uploadDatasetVersionResponse.status === 201) {
                        validateDatasetService(
                            request.datasetId,
                            request.fundingStreamId,
                            request.filename,
                            request.version.toString(),
                            description,
                            changeNote).then((validateDatasetResponse) => {
                            if (validateDatasetResponse.status === 200 || validateDatasetResponse.status === 201) {
                                const validateOperationId: any = validateDatasetResponse.data.operationId;
                                if (!validateOperationId)
                                {
                                    setValidationFailures({"error-message": ["Unable to locate dataset validate operationId"]});
                                    setIsLoading(false);
                                    return;
                                }
                                getDatasetValidateStatus(validateOperationId)
                            }
                            else
                            {
                                setValidationFailures({"error-message": ["Unable to validate dataset"]});
                                setIsLoading(false);
                                return;
                            }
                        }).catch(() => {
                            setValidationFailures({"error-message": ["Unable to validate dataset"]});
                            setIsLoading(false);
                        })
                    }
                    else
                    {
                        setValidationFailures({"error-message": ["Unable to upload file"]});
                        setIsLoading(false);
                        return;
                    }
                })
        }
        else
        {
            setIsLoading(false);
            return;
        }
    }

    function getDatasetValidateStatus(operationId: string)
    {
        getDatasetValidateStatusService(operationId).then((datasetValidateStatusResponse) => {
            if (datasetValidateStatusResponse.status === 200 || datasetValidateStatusResponse.status === 201) {
                const result: DatasetValidateStatusResponse = datasetValidateStatusResponse.data;
                if (result.currentOperation === "Validated") {
                    history.push("/Datasets/ManageDataSourceFiles");
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
            }
            else
            {
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

    function validateForm()
    {
        setValidation(prevState => {
            return {
                ...prevState,
                changeNoteValid: true,
                fileValid: true
            }
        });
        setValidationFailures(undefined);

        let isValid = true;

        if (uploadFile === undefined)
        {
            setValidation(prevState => {
                return {
                    ...prevState,
                    fileValid: false
                }
            });

            isValid = false;
        }
        else {
            if (validExtensions.indexOf(uploadFileExtension) < 0)
            {
                setValidation(prevState => {
                    return {
                        ...prevState,
                        fileValid: false
                    }
                });
                isValid = false;
            }
        }

        if (changeNote === "" )
        {
            setValidation(prevState => {
                return {
                    ...prevState,
                    changeNoteValid: false
                }
            });
            isValid = false;
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
                    <ul className="govuk-list govuk-error-summary__list">
                        {
                            (validationFailures !== undefined || !validation.fileValid) ?
                                <li><a href={"#select-data-source"}>Upload a xls or xlsx file</a></li>
                                : ""
                        }
                        {
                            (!validation.changeNoteValid) ?
                                <li><a href={"#change-note"}>Enter change note</a></li>
                                : ""
                        }
                    </ul>
                </div>
            </div>
            <fieldset className="govuk-fieldset" hidden={isLoading}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h1 className="govuk-fieldset__heading govuk-!-margin-bottom-5">
                        Update data source
                    </h1>
                </legend>
                <details className="govuk-details" data-module="govuk-details">
                    <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                    {dataset.name} (version {dataset.version})
                </span>
                    </summary>
                    <div className="govuk-details__text">
                        {dataset.lastUpdatedByName}
                        <span className="govuk-!-margin-left-2"><DateFormatter utc={false} date={dataset.lastUpdatedDate}/></span>
                    </div>
                </details>
                <div id="select-data-source"
                    className={"govuk-form-group" + (validationFailures !== undefined || !validation.fileValid ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="file-upload-data-source">
                        Select data source file
                    </label>
                    {
                        (validationFailures !== undefined || !validation.fileValid) ?
                            <span className="govuk-error-message">
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
                                    (validationFailures !== undefined && validationFailures["blobUrl"] != null)?
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

                <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                    onClick={submitDataSourceFile}>
                    Save
                </button>
                <Link to={`/Datasets/ManageData`} className="govuk-button govuk-button--secondary"
                      data-module="govuk-button">
                    Cancel
                </Link>
            </fieldset>
        </div>
    </div>
}
