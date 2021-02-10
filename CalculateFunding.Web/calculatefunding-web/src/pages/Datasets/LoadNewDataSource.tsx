import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {AutoComplete} from "../../components/AutoComplete";
import {
    createDatasetService,
    downloadValidateDatasetValidationErrorSasUrl,
    getDatasetDefinitionsService,
    getDatasetsForFundingStreamService,
    uploadDataSourceService,
    validateDatasetService
} from "../../services/datasetService";
import {CreateDatasetRequestViewModel} from "../../types/Datasets/CreateDatasetRequestViewModel";
import {useHistory} from "react-router";
import {FundingStream} from "../../types/viewFundingTypes";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {
    NewDatasetVersionResponseErrorModel,
    NewDatasetVersionResponseViewModel
} from "../../types/Datasets/NewDatasetVersionResponseViewModel";
import {AxiosError} from "axios";
import {Link} from "react-router-dom";
import {getFundingStreamsService} from "../../services/policyService";
import {Footer} from "../../components/Footer";
import {PermissionStatus} from "../../components/PermissionStatus";
import {DataschemaDetailsViewModel} from "../../types/Datasets/DataschemaDetailsViewModel";
import {usePermittedFundingStreams} from "../../hooks/useFundingStreamPermissions";
import {UserPermission} from "../../types/UserPermission";
import {useErrors} from "../../hooks/useErrors";
import {useMonitorForAnyNewJob} from "../../hooks/Jobs/useMonitorForAnyNewJob";
import {JobType} from "../../types/jobType";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {RunningStatus} from "../../types/RunningStatus";

export function LoadNewDataSource() {
    const [fundingStreamSuggestions, setFundingStreamSuggestions] = useState<FundingStream[]>([]);
    const [dataSchemaSuggestions, setDataSchemaSuggestions] = useState<DataschemaDetailsViewModel[]>([]);
    const [selectedFundingStream, setSelectedFundingStream] = useState<FundingStream | undefined>();
    const [selectedDataSchema, setSelectedDataSchema] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState<string>("");
    const [datasetSourceFileName, setDatasetSourceFileName] = useState<string>("");
    const [uploadFileName, setUploadFileName] = useState<string>("");
    const [uploadFile, setUploadFile] = useState<File>();
    const [fundingStreamIsLoading, setFundingStreamIsLoading] = useState<boolean>(false);
    const [dataSchemaIsLoading, setDataSchemaIsLoading] = useState<boolean>(false);
    const [fundingStreamsIsFiltered, setFundingStreamsIsFiltered] = useState<boolean>(false);
    const [validateForm, setValidateForm] = useState({
        fileNameValid: true,
        descriptionValid: true,
        dataDefinitionIdValid: true,
        fileValid: true,
        fundingStreamValid: true
    });
    const history = useHistory();
    const requiredPermission = UserPermission.CanUploadDataSourceFiles;
    const permittedFundingStreams = usePermittedFundingStreams(requiredPermission);
    const {errors, addError, addValidationErrors, clearErrorMessages} = useErrors();
    const {newJob} = useMonitorForAnyNewJob(
        [JobType.ValidateDatasetJob],
        err => addError({error: err, description: "An error occurred while monitoring the running jobs."}));
    const [validateDatasetJobId, setValidateDatasetJobId] = useState<string>("");
    const [fundingStreams, setFundingStreams] = useState<FundingStream[]>([]);
    const validExtensions = [".csv", ".xls", ".xlsx"];


    useEffect(() => {
        filterFundingStreamsByPermittedStreams();
    }, [permittedFundingStreams]);

    useEffect(() => {
        if (!newJob || newJob.jobId !== validateDatasetJobId) return;
        if (newJob.runningStatus === RunningStatus.Completed) {
            if (newJob.isSuccessful && newJob.outcome !== "ValidationFailed") {
                history.push("/Datasets/ManageDataSourceFiles");
            } else {
                downloadValidateDatasetValidationErrorSasUrl(validateDatasetJobId).then((result) => {
                    let validationErrorFileUrl = result.data;
                    addValidationErrors({validationErrors: {"blobUrl": [validationErrorFileUrl]}, message: "Validation failed"});
                    setIsLoading(false);
                }).catch((err) => {
                    addError({error: "Unable to retrieve validation report", description: "Validation failed"});
                    setIsLoading(false);
                });
            }
        }
    }, [newJob]);

    useEffect(() => {
        if (fundingStreams.length > 0 && !fundingStreamsIsFiltered) {
            filterFundingStreamsByPermittedStreams();
            setFundingStreamsIsFiltered(true);
        }
    }, [fundingStreams]);

    function filterFundingStreamsByPermittedStreams() {
        const permittedStreams = fundingStreams.filter(fs => permittedFundingStreams.some(permitted => permitted === fs.id));
        if (fundingStreamSuggestions.length !== permittedStreams.length) {
            setFundingStreamSuggestions(permittedStreams);
        }
    }

    function updateFundingStreamSelection(e: string) {
        const result = fundingStreamSuggestions.filter(x => x.name === e)[0];
        if (result) {
            setSelectedFundingStream(result);
            populateDataSchemaSuggestions(result.id);
        } else {
            setSelectedFundingStream(undefined);
            populateDataSchemaSuggestions();
        }
    }

    function updateDataSchemaSelection(e: string) {
        const selection = dataSchemaSuggestions.filter(x => x.name === e)[0];

        if (selection) {
            setSelectedDataSchema(selection.id);
        } else {
            setSelectedDataSchema("");
        }
    }

    function populateDataSchemaSuggestions(fundingStreamId?: string) {
        setDataSchemaIsLoading(true);
        if (fundingStreamId) {
            getDatasetsForFundingStreamService(fundingStreamId)
                .then((datasetsResponse) => setDataSchemaSuggestions(datasetsResponse.data))
                .catch(err => addError({
                    error: err,
                    description: `Error while getting datasets for funding stream ${fundingStreamId}`
                }))
                .finally(() => setDataSchemaIsLoading(false));
        } else {
            getDatasetDefinitionsService()
                .then((result) => setDataSchemaSuggestions(result.data))
                .catch(err => addError({error: err, description: `Error while getting dataset definitions`}))
                .finally(() => setDataSchemaIsLoading(false));
        }
    }

    async function populateFundingStreamSuggestions() {
        setFundingStreamIsLoading(true);
        getFundingStreamsService(false)
            .then((response) => {
                setFundingStreams(response.data);
            })
            .catch(err => addError({error: err, description: `Error while getting funding streams`}))
            .finally(() => setFundingStreamIsLoading(false));
    }


    async function uploadFileToServer(request: NewDatasetVersionResponseViewModel) {
        if (uploadFile) {
            await uploadDataSourceService(
                request.blobUrl,
                uploadFile,
                request.datasetId,
                request.fundingStreamId,
                request.author.name,
                request.author.id,
                selectedDataSchema,
                datasetSourceFileName,
                description)
                .then(() => {
                    validateDatasetService(
                        request.datasetId,
                        request.fundingStreamId,
                        request.filename,
                        request.version.toString(),
                        false,
                        description,
                        "").then((validateDatasetResponse) => {
                        const validateOperationId: any = validateDatasetResponse.data.operationId;
                        if (!validateOperationId) {
                            addError({error: "Unable to locate dataset validate operationId"})
                            setIsLoading(false);
                            return;
                        }
                        setValidateDatasetJobId(validateDatasetResponse.data.validateDatasetJobId);
                        setIsLoading(true);
                    }).catch(() => {
                        addError({error: "Unable to validate dataset"})
                        setIsLoading(false);
                        return;
                    })
                }).catch(() => {
                    addError({
                        error: "Unable to upload file",
                        suggestion: "Please check the file is valid and not locked"
                    })
                    setIsLoading(false);
                    return;
                });
        } else {
            setValidateForm(prevState => {
                return {
                    ...prevState,
                    fileValid: false
                }
            });
        }
    }

    function createDataset() {
        clearErrorMessages();
        const request: CreateDatasetRequestViewModel = {
            name: datasetSourceFileName,
            filename: uploadFileName,
            dataDefinitionId: selectedDataSchema,
            description: description,
            fundingStreamId: selectedFundingStream !== undefined ? selectedFundingStream.id : ""
        };

        if (request.name !== "" && request.filename !== "" && request.description !== "" && request.dataDefinitionId !== "" && request.fundingStreamId !== "") {
            setValidateForm(prevState => {
                return {
                    ...prevState,
                    fileNameValid: true,
                    fileValid: true,
                    descriptionValid: true,
                    dataDefinitionIdValid: true
                }
            });
            setIsLoading(true);
            createDatasetService(request)
                .then((result) => {
                    const response = result.data as NewDatasetVersionResponseViewModel;
                    uploadFileToServer(response);
                })
                .catch((error: AxiosError) => {
                    if (error.response !== undefined) {
                        const errorResponse = error.response.data as NewDatasetVersionResponseErrorModel;
                        if (errorResponse) {
                            if (errorResponse.Name && errorResponse.Name.length > 0) {
                                addError({error: "Unable to upload file", suggestion: errorResponse.Name[0]})
                                if (errorResponse.Name[0] === "Use a descriptive unique name other users can understand") {
                                    setValidateForm(prevState => {
                                        return {
                                            ...prevState,
                                            fileNameValid: false
                                        }
                                    })
                                }
                            }
                            if (errorResponse.DefinitionId && errorResponse.DefinitionId.length > 0) {
                                addError({error: "Unable to upload file", suggestion: errorResponse.DefinitionId})
                            }
                        } else {
                            addError({
                                error: "Unable to upload file",
                                suggestion: "Please check the file is valid and not locked"
                            })
                        }
                    }
                    setIsLoading(false);
                });
        } else {
            if (request.name === "") {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        fileNameValid: false
                    }
                })
            }
            if (request.dataDefinitionId === "") {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        dataDefinitionIdValid: false
                    }
                })
            }

            if (request.description === "") {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        descriptionValid: false
                    }
                })
            }
            if (request.filename === "") {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        fileValid: false
                    }
                })
            }
            if (request.fundingStreamId === "") {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        fundingStreamValid: false
                    }
                })
            }
        }
    }

    useEffectOnce(() => {
        populateFundingStreamSuggestions();
        populateDataSchemaSuggestions();
    });

    useEffect(() => {
        if (fundingStreamSuggestions.length > 0) {
            if (datasetSourceFileName !== "") {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        fileNameValid: true
                    }
                })
            } else {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        fileNameValid: false
                    }
                })
            }
        }
    }, [datasetSourceFileName]);

    useEffect(() => {
        if (fundingStreamSuggestions.length > 0) {
            if (description !== "") {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        descriptionValid: true
                    }
                })
            } else {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        descriptionValid: false
                    }
                })
            }
        }

    }, [description]);

    useEffect(() => {
        if (fundingStreamSuggestions.length > 0) {
            if (uploadFileName !== "") {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        fileValid: true
                    }
                })
            } else {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        fileValid: false
                    }
                })
            }
        }
    }, [uploadFileName]);

    useEffect(() => {
        if (fundingStreamSuggestions.length > 0) {
            if (selectedDataSchema !== "") {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        dataDefinitionIdValid: true
                    }
                })
            } else {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        dataDefinitionIdValid: false
                    }
                })
            }
        }
    }, [selectedDataSchema]);

    useEffect(() => {
        if (fundingStreamSuggestions.length > 0) {
            if (selectedFundingStream && selectedFundingStream.id !== "") {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        fundingStreamValid: true
                    }
                })
            } else {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        fundingStreamValid: false
                    }
                })
            }
        }
    }, [selectedFundingStream]);

    function storeFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files !== null) {
            const file: File = e.target.files[0];
            const fileExtention = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (validExtensions.indexOf(fileExtention) < 0) {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        fileValid: false
                    }
                });
                addError({error: "Please check the file is valid, upload a CSV, XLS or XLSX file"});
                return;
            }
            setUploadFileName(file.name);
            setUploadFile(file);
        }
    }

    function CreateDataSourceButton() {
        const isDisabled = permittedFundingStreams.length === 0;
        return (
            <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                    onClick={createDataset} disabled={isDisabled} data-testid="create-button">
                Create data source
            </button>
        );
    }

    return (<div>
            <Header location={Section.Datasets}/>
            <div className="govuk-width-container">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <Breadcrumbs>
                            <Breadcrumb name={"Calculate funding"} url={"/"}/>
                            <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"}/>
                            <Breadcrumb name={"Manage data source files"} url={"/Datasets/ManageDataSourceFiles"}/>
                            <Breadcrumb name={"Load new data source file"}/>
                        </Breadcrumbs>
                    </div>
                </div>
                <LoadingStatus title={"Create data source"} hidden={!isLoading}
                               subTitle={"Please wait whilst the data source is created"}/>
                <div className="govuk-grid-row govuk-!-margin-bottom-9">
                    <div className="govuk-grid-column-full">
                        <MultipleErrorSummary errors={errors}/>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <PermissionStatus requiredPermissions={[requiredPermission]}
                                          hidden={permittedFundingStreams.length > 0
                                          || dataSchemaIsLoading
                                          || fundingStreamIsLoading}/>
                    </div>
                </div>
                <div className="govuk-grid-row" hidden={isLoading}>
                    <div className="govuk-grid-column-two-thirds">
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">Upload new data source</h1>
                        <p className="govuk-body">Load a new data source file to create a dataset to use in
                            calculations.</p>
                        <div
                            className={"govuk-form-group" + (validateForm.fundingStreamValid ? "" : " govuk-form-group--error")}>
                            <label className="govuk-label" htmlFor="sort">
                                Funding stream
                            </label>
                            <span className="govuk-hint">
                            Select a funding stream you have permissions for
                        </span>
                            {fundingStreamIsLoading ?
                                <div className="loader-inline">
                                    <LoadingFieldStatus title={"loading funding streams"}/>
                                </div>
                                :
                                <AutoComplete suggestions={fundingStreamSuggestions.map(fs => fs.name)}
                                              callback={updateFundingStreamSelection}
                                              disabled={fundingStreamIsLoading}/>
                            }

                        </div>
                        <div
                            className={"govuk-form-group" + (validateForm.dataDefinitionIdValid ? "" : " govuk-form-group--error")}>
                            <label className="govuk-label" htmlFor="sort">
                                Data schema
                            </label>
                            {dataSchemaIsLoading ? <LoadingFieldStatus title={"loading data schemas"}/> :
                                <AutoComplete suggestions={dataSchemaSuggestions.map(dss => dss.name)}
                                              callback={updateDataSchemaSelection}
                                              disabled={dataSchemaIsLoading}/>}

                        </div>

                        <div
                            className={"govuk-form-group" + (validateForm.fileNameValid ? "" : " govuk-form-group--error")}>
                            <label className="govuk-label" htmlFor="address-line-1">
                                Dataset source file name
                            </label>
                            <span id="event-name-hint" className="govuk-hint">
                            Use a descriptive unique name other users can understand
                            </span>
                            <input className="govuk-input" id="dataset-source-filename" name="dataset-source-filename"
                                   type="text"
                                   onChange={(e) => setDatasetSourceFileName(e.target.value)}
                                   data-testid="new-datasource-filename"/>
                        </div>

                        <div
                            className={"govuk-form-group" + (validateForm.descriptionValid ? "" : " govuk-form-group--error")}>
                            <label className="govuk-label" htmlFor="more-detail">
                                Description
                            </label>
                            <textarea className="govuk-textarea" id="more-detail" name="more-detail" rows={8}
                                      aria-describedby="more-detail-hint"
                                      onChange={(e) => setDescription(e.target.value)}
                                      data-testid="new-datasource-description"/>
                        </div>
                        <div
                            className={"govuk-form-group" + (validateForm.fileValid ? "" : " govuk-form-group--error")}>
                            <div className="govuk-form-group">
                                <label className="govuk-label" htmlFor="file-upload-1">
                                    Upload data source file
                                </label>
                                <input className="govuk-file-upload"
                                       id="file-upload-1"
                                       name="file-upload-1"
                                       type="file"
                                       onChange={storeFileUpload}/>
                            </div>
                        </div>
                        <CreateDataSourceButton/>
                        <Link to="/Datasets/ManageDataSourceFiles" className="govuk-button govuk-button--secondary"
                              data-module="govuk-button">
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}