import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {RouteComponentProps, useHistory} from "react-router";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {DatasetChangeType, DatasetVersionHistoryViewModel, DatasetVersionHistoryItem} from "../../types/Datasets/DatasetVersionHistoryViewModel";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import * as datasetService from "../../services/datasetService";
import {DateTimeFormatter} from "../../components/DateTimeFormatter";
import {UpdateNewDatasetVersionResponseViewModel} from "../../types/Datasets/UpdateDatasetRequestViewModel";
import {Footer} from "../../components/Footer";
import {UpdateStatus} from "../../types/Datasets/UpdateStatus";
import {MergeSummary} from "./MergeSummary/MergeSummary";
import {MergeMatch} from "./MergeSummary/MergeMatch";
import {MergeDatasetViewModel} from "../../types/Datasets/MergeDatasetViewModel";
import {useErrors} from "../../hooks/useErrors";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import * as providerService from "../../services/providerService";
import {DateFormatter} from "../../components/DateFormatter";
import {JobDetails} from "../../types/jobDetails";
import {DatasetEmptyFieldEvaluationOptions} from "../../types/Datasets/DatasetEmptyFieldEvaluationOptions";
import {RunningStatus} from "../../types/RunningStatus";
import {JobSubscription, MonitorFallback, MonitorMode, useJobSubscription} from "../../hooks/Jobs/useJobSubscription";

export interface UpdateDataSourceFileRouteProps {
    fundingStreamId: string;
    datasetId: string;
}

export function UpdateDataSourceFile({match}: RouteComponentProps<UpdateDataSourceFileRouteProps>) {
    const [dataset, setDataset] = useState<DatasetVersionHistoryItem>({
        id: "",
        blobName: "",
        changeNote: "",
        datasetId: "",
        definitionName: "",
        description: "",
        lastUpdatedByName: "",
        lastUpdatedDate: new Date(),
        name: "",
        version: 0,
        changeType: DatasetChangeType.Unknown
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingForJob, setIsCheckingForJob] = useState(false);
    const [updateType, setUpdateType] = useState<string>("");
    const [datasetEmptyFieldEvaluationOptions, setDatasetEmptyFieldEvaluationOptions]
        = useState<DatasetEmptyFieldEvaluationOptions>(DatasetEmptyFieldEvaluationOptions.NA);
    const [uploadFileName, setUploadFileName] = useState<string>("");
    const [uploadFile, setUploadFile] = useState<File>();
    const [uploadFileExtension, setUploadFileExtension] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [changeNote, setChangeNote] = useState<string>("");
    const [coreProviderTargetDate, setCoreProviderTargetDate] = useState<Date>();
    const validExtensions = [".csv", ".xls", ".xlsx"];
    const [validation, setValidation] = useState({
        fileValid: true,
        changeNoteValid: true,
        updateTypeValid: true,
        mergeConfirmationValid: true
    });
    const [mergeResults, setMergeResults] = useState<MergeDatasetViewModel>();
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(UpdateStatus.Unset);
    const history = useHistory();
    const {errors, addError, addValidationErrors, clearErrorMessages} = useErrors();
    const [jobSubscription, setJobSubscription] = useState<JobSubscription>();
    const {addSub, removeSub, results: jobNotifications} = useJobSubscription({
        onError: err => addError({error: err, description: "An error occurred while monitoring the running jobs"})
    });
    const [validateDatasetJobId, setValidateDatasetJobId] = useState<string>("");

    useEffect(() => {
        if (jobNotifications.length === 0) return;

        const notification = jobNotifications.find(n => n.subscription.id === jobSubscription?.id);
        const newJob = notification?.latestJob;

        if (!notification || !newJob || newJob.runningStatus !== RunningStatus.Completed) return;

        removeSub(notification.subscription.id);
        setJobSubscription(undefined);

        if (newJob.isSuccessful) {
            return onDatasetValidated(updateType);
        } else {
            onValidationJobFailed(newJob);
        }
        clearErrorMessages();
        setIsLoading(false);
    }, [jobNotifications]);

    function onValidationJobFailed(newJob: JobDetails) {
        if (!newJob.outcome) {
            addError({error: "Unable to retrieve validation outcome", description: "Validation failed"});
        } else {
            if (newJob.outcome === "ValidationFailed") {
                getFailedValidationReportFile();
            } else {
                addError({error: newJob.outcome});
            }
        }
    }

    function getFailedValidationReportFile() {
        datasetService.downloadValidateDatasetValidationErrorSasUrl(validateDatasetJobId)
            .then((result) => {
                const validationErrorFileUrl = result.data;
                addValidationErrors({
                    validationErrors: {"blobUrl": [validationErrorFileUrl]},
                    message: "Validation failed"
                });
                setIsLoading(false);
            }).catch((err) => {
            addError({error: "Unable to retrieve validation report", description: "Validation failed"});
        });
    }

    useEffectOnce(() => {
        setIsLoading(true);
        datasetService.getDatasetHistoryService(match.params.datasetId, 1, 1)
            .then((result) => {
                const response = result.data as DatasetVersionHistoryViewModel;
                setDataset(response.results[0]);
                setDescription(response.results[0].description);
                setChangeNote(response.results[0].changeNote);
                providerService.getCurrentProviderVersionForFundingStream(match.params.fundingStreamId)
                    .then((providerVersionResult) => {
                        const providerVersion = providerVersionResult.data;
                        if (providerVersion != null) {
                            setCoreProviderTargetDate(providerVersion.targetDate);
                        }
                    })
                    .catch(err => addError({
                        error: err,
                        description: `Error while getting current provider version for funding stream ${match.params.fundingStreamId}`
                    }));
            }).catch((err) => addError({
                error: err,
                description: `Error while getting dataset ${match.params.datasetId}`
            })
        ).finally(() => {
            setIsLoading(false);
        });
    });

    function submitDataSourceFile() {

        if (!validateForm()) {
            return;
        }

        clearErrorMessages();
        setIsLoading(true);

        datasetService.updateDatasetService(match.params.fundingStreamId, match.params.datasetId, uploadFileName)
            .then((result) => {
                const newDataset = result.data as UpdateNewDatasetVersionResponseViewModel;
                newDataset.mergeExisting = updateType === "merge";
                uploadFileToServer(newDataset);
            })
            .catch((err) => {
                addError({error: err, description: "Unable to update data source"});
                setIsLoading(false);
            });
    }

    function uploadFileToServer(request: UpdateNewDatasetVersionResponseViewModel) {
        if (!!uploadFile) {
            datasetService.uploadDatasetVersionService(request, uploadFile)
                .then(newDatasetUploadResponse => {
                    datasetService.validateDatasetService(
                        request.datasetId,
                        request.fundingStreamId,
                        request.filename,
                        request.version.toString(),
                        request.mergeExisting,
                        description,
                        changeNote,
                        datasetEmptyFieldEvaluationOptions)
                        .then((validateDatasetResponse) => {
                            const validateOperationId: any = validateDatasetResponse.data.operationId;
                            if (!validateOperationId) {
                                addError({error: "Unable to locate dataset validate operationId"});
                                setIsLoading(false);
                                return;
                            }
                            const validationJobId = validateDatasetResponse.data.validateDatasetJobId;
                            setValidateDatasetJobId(validationJobId); // todo: redundant?
                            const subscription = addSub({
                                filterBy: {jobId: validationJobId},
                                monitorMode: MonitorMode.SignalR,
                                monitorFallback: MonitorFallback.Polling,
                                onError: err => addError({
                                    error: err,
                                    description: "An error occurred while monitoring the running jobs"
                                })
                            }) as JobSubscription;
                            setJobSubscription(subscription);
                            setIsCheckingForJob(true);
                            setIsLoading(true);
                        })
                        .catch((error) => {
                            if (error.response && error.response.data[""] !== undefined && error.response.data[""] !== "") {
                                addError({error: error.response.data[""]});
                            } else {
                                addError({
                                    error: "Unable to retrieve validation report",
                                    description: "Validation failed"
                                });
                            }
                            setIsLoading(false);
                            return;
                        })
                })
                .catch(() => {
                    addError({error: "Unable to upload file"});
                    setIsLoading(false);
                    return;
                });
        } else {
            setIsLoading(false);
            return;
        }
    }

    function onDatasetValidated(updateType: string) {
        if (updateType === "merge") {
            datasetService.getCurrentDatasetVersionByDatasetId(match.params.datasetId)
                .then((response) => {
                    const mergeDatasetResult = response.data as MergeDatasetViewModel;

                    if (mergeDatasetResult.amendedRowCount === 0 && mergeDatasetResult.newRowCount === 0) {
                        setUpdateStatus(UpdateStatus.Matched)
                    } else {
                        setUpdateStatus(UpdateStatus.Successful);
                    }

                    setMergeResults(mergeDatasetResult);
                    setIsLoading(false);
                });
            return;
        } else {
            history.push("/Datasets/ManageDataSourceFiles");
            return;
        }
    }

    function validateForm() {
        setValidation(prevState => {
            return {
                ...prevState,
                changeNoteValid: true,
                fileValid: true,
                updateTypeValid: true,
                mergeConfirmationValid: true
            }
        });

        clearErrorMessages();

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
            });
            isValid = false;
        }

        if (updateType === "merge" && datasetEmptyFieldEvaluationOptions === DatasetEmptyFieldEvaluationOptions.NA) {
            setValidation(prevState => {
                return {
                    ...prevState,
                    mergeConfirmationValid: false
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
            <LoadingStatus title={"Update data source"} hidden={!isLoading}
                           subTitle={"Please wait whilst the data source is updated"}/>

            <MultipleErrorSummary errors={errors}/>

            <fieldset className="govuk-fieldset" hidden={isLoading || updateStatus !== UpdateStatus.Unset}>
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                    <h1 className="govuk-fieldset__heading govuk-!-margin-bottom-5">
                        Update {dataset.name} (version {dataset.version})
                    </h1>
                </legend>
                <dl className="govuk-summary-list govuk-summary-list--no-border core-provider-dataversion">
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                            Last updated by
                        </dt>
                        <dd className="govuk-summary-list__value"
                            data-testid="update-datasource-author"> {dataset.lastUpdatedByName} <span
                            className="govuk-!-margin-left-2">
                                <DateTimeFormatter date={dataset.lastUpdatedDate}/>
                            </span>
                        </dd>
                    </div>
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                            Core provider data version to upload against
                        </dt>
                        <dd className="govuk-summary-list__value" data-testid="provider-target-date"><DateFormatter
                            date={coreProviderTargetDate}/>
                        </dd>
                    </div>
                </dl>
                <div id="update-type"
                     className={"govuk-form-group" + (!validation.updateTypeValid ? " govuk-form-group--error" : "")}>
                    <div className="govuk-radios">
                        <label className="govuk-label govuk-!-margin-bottom-5" htmlFor="update-type-radios">
                            Select update type
                        </label>
                        <div className="govuk-radios__item">
                            <input className="govuk-radios__input" id="update-type-merge" name="update-type"
                                   type="radio" data-testid="update-datasource-merge" value="merge"
                                   onClick={(e) => setUpdateType(e.currentTarget.value)}/>
                            <label className="govuk-label govuk-radios__label" htmlFor="update-type-merge">
                                Merge existing version
                            </label>
                            <div id="update-type-merge-hint" className="govuk-hint govuk-radios__hint">
                                Combine a new data source with the existing file
                            </div>
                        </div>
                        <div className="govuk-radios__item">
                            <input className="govuk-radios__input" id="update-type-new" name="update-type" type="radio"
                                   value="new" data-testid="update-datasource-new"
                                   onClick={(e) => setUpdateType(e.currentTarget.value)}/>
                            <label className="govuk-label govuk-radios__label" htmlFor="update-type-new">
                                Create new version
                            </label>
                            <div id="update-type-new-hint" className="govuk-hint govuk-radios__hint">
                                Replace the existing data source with a new file
                            </div>
                        </div>
                    </div>
                </div>
                {(updateType === "merge") &&
                <div data-testid="update-type-merge-confirmation"
                     className={"govuk-form-group" + (!validation.mergeConfirmationValid ? " govuk-form-group--error" : "")}>
                    <div className="govuk-radios">
                        <label className="govuk-label govuk-!-margin-bottom-5" htmlFor="update-type-radios">
                            Do you want to treat empty cells as values when updating providers?
                        </label>
                        <div className="govuk-radios__item">
                            <input className="govuk-radios__input" id="update-datasource-merge-blank-yes"
                                   name="update-merge-confirmation"
                                   type="radio" data-testid="update-datasource-merge-blank-yes" value="merge"
                                   onClick={() =>
                                       setDatasetEmptyFieldEvaluationOptions(DatasetEmptyFieldEvaluationOptions.AsNull)}/>
                            <label className="govuk-label govuk-radios__label"
                                   htmlFor="update-datasource-merge-blank-yes">
                                Yes
                            </label>
                            <div id="update-type-merge-hint" className="govuk-hint govuk-radios__hint">
                                Allow an empty cell to replace an existing previous value
                            </div>
                        </div>
                        <div className="govuk-radios__item">
                            <input className="govuk-radios__input" id="update-datasource-merge-blank-no"
                                   name="update-merge-confirmation"
                                   type="radio" value="new" data-testid="update-datasource-merge-blank-no"
                                   onClick={() =>
                                       setDatasetEmptyFieldEvaluationOptions(DatasetEmptyFieldEvaluationOptions.Ignore)}/>
                            <label className="govuk-label govuk-radios__label"
                                   htmlFor="update-datasource-merge-blank-no">
                                No
                            </label>
                            <div id="update-type-new-hint" className="govuk-hint govuk-radios__hint">
                                Ignore any empty cells in the file upload
                            </div>
                        </div>
                    </div>
                </div>
                }
                <div id="select-data-source"
                     className={"govuk-form-group" + (!validation.fileValid ? " govuk-form-group--error" : "")}>
                    <label className="govuk-label" htmlFor="file-upload-data-source">
                        Select data source file
                    </label>
                    {
                        (!validation.fileValid) ?
                            <span id="data-source-error-message" className="govuk-error-message">
                                <span className="govuk-visually-hidden">Error:</span>
                                {
                                    (!validation.fileValid) ?
                                        "Upload a xls or xlsx file"
                                        : ""
                                }
                            </span>
                            : ""
                    }
                    <input className={"govuk-file-upload" + (!validation.fileValid ? " govuk-file-upload--error" : "")}
                           id="file-upload-data-source" name="file-upload-data-source" type="file"
                           onChange={(e) => storeFileUpload(e)}
                           accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                           data-testid="update-datasource-file-upload"/>
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

                <div id="change-note"
                     className={"govuk-form-group" + (!validation.changeNoteValid ? " govuk-form-group--error" : "")}>
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
                    <textarea
                        className={"govuk-textarea" + (!validation.changeNoteValid ? " govuk-textarea--error" : "")}
                        rows={5}
                        aria-describedby="more-detail-hint" value={changeNote}
                        onChange={(e) => setChangeNote(e.target.value)}
                        data-testid="update-datasource-changenote">
                    </textarea>
                </div>

                <button id={"submit-datasource-file"} className="govuk-button govuk-!-margin-right-1"
                        data-module="govuk-button"
                        onClick={submitDataSourceFile} data-testid="update-datasource-save">
                    Save
                </button>
                <Link id={"cancel-datasource-link"} to={`/Datasets/ManageData`}
                      className="govuk-button govuk-button--secondary"
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
