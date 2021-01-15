import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {AutoComplete} from "../../components/AutoComplete";
import {createDatasetService, getDatasetDefinitionsService, getDatasetsForFundingStreamService, getDatasetValidateStatusService, uploadDataSourceService, validateDatasetService} from "../../services/datasetService";
import {CreateDatasetRequestViewModel} from "../../types/Datasets/CreateDatasetRequestViewModel";
import {useHistory} from "react-router";
import {FundingStream} from "../../types/viewFundingTypes";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {NewDatasetVersionResponseErrorModel, NewDatasetVersionResponseViewModel} from "../../types/Datasets/NewDatasetVersionResponseViewModel";
import {AxiosError} from "axios";
import {ErrorSummary} from "../../components/ErrorSummary";
import {Link} from "react-router-dom";
import {DatasetValidateStatusResponse, ValidationStates} from "../../types/Datasets/UpdateDatasetRequestViewModel";
import {getFundingStreamsService} from "../../services/policyService";
import {Footer} from "../../components/Footer";
import {PermissionStatus} from "../../components/PermissionStatus";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";
import {useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {DataschemaDetailsViewModel} from "../../types/Datasets/DataschemaDetailsViewModel";
import {usePermittedFundingStreams} from "../../hooks/useFundingStreamPermissions";
import {UserPermission} from "../../types/UserPermission";

export function LoadNewDataSource() {
    const permissions: FundingStreamPermissions[] = useSelector((state: IStoreState) => state.userState.fundingStreamPermissions);
    const [fundingStreamSuggestions, setFundingStreamSuggestions] = useState<FundingStream[]>([]);
    const [dataSchemaSuggestions, setDataSchemaSuggestions] = useState<DataschemaDetailsViewModel[]>([]);
    const [selectedFundingStream, setSelectedFundingStream] = useState<FundingStream | undefined>();
    const [selectedDataSchema, setSelectedDataSchema] = useState<string>("");
    const [validationFailures, setValidationFailures] = useState<{ [key: string]: string[] }>();
    const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState<string>("Create data source");
    const [description, setDescription] = useState<string>("");
    const [datasetSourceFileName, setDatasetSourceFileName] = useState<string>("");
    const [uploadFileName, setUploadFileName] = useState<string>("");
    const [uploadFile, setUploadFile] = useState<File>();
    const [fundingStreamIsLoading, setFundingStreamIsLoading] = useState<boolean>(false);
    const [dataSchemaIsLoading, setDataSchemaIsLoading] = useState<boolean>(false);
    const [validateForm, setValidateForm] = useState({
        nameValid: true,
        descriptionValid: true,
        dataDefinitionIdValid: true,
        filenameValid: true,
        fundingStreamValid: true
    });
    const [errorResponse, setErrorResponse] = useState<NewDatasetVersionResponseErrorModel>();
    const history = useHistory();
    const permittedFundingStreams = usePermittedFundingStreams(UserPermission.CanUploadDataSourceFiles);

    useEffect(() => {
        setMissingPermissions([]);
        if (!selectedFundingStream) return;
        if (!permittedFundingStreams || !permittedFundingStreams.includes(selectedFundingStream.id)) {
            setMissingPermissions([`create a datasource file for the ${selectedFundingStream.name} funding stream`]);
        }
    }, [permissions, selectedFundingStream]);

    function getDatasetValidateStatus(operationId: string) {
        getDatasetValidateStatusService(operationId)
            .then((datasetValidateStatusResponse) => {
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
                } else {
                    setValidationFailures({"error-message": ["Unable to get validation status"]});
                    setIsLoading(false);
                    return;
                }

                setTimeout(function () {
                    getDatasetValidateStatus(operationId);
                }, 2500);
            })
            .catch(() => {
                setValidationFailures({"error-message": ["Unable to get validation status"]});
                setIsLoading(false);
            });
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
                .finally(() => setDataSchemaIsLoading(false));
        } else {
            getDatasetDefinitionsService()
                .then((result) => setDataSchemaSuggestions(result.data))
                .finally(() => setDataSchemaIsLoading(false));
        }
    }

    async function populateFundingStreamSuggestions() {
        setFundingStreamIsLoading(true);
        getFundingStreamsService(false)
            .then((response) => {
                const permittedStreams = response.data.filter(fs => permittedFundingStreams.some(permitted => permitted === fs.id));
                setFundingStreamSuggestions(permittedStreams);
            })
            .finally(() => setFundingStreamIsLoading(false));
    }

    async function uploadFileToServer(request: NewDatasetVersionResponseViewModel) {
        if (uploadFile) {
            try {
                const uploadResponse = await uploadDataSourceService(
                    request.blobUrl,
                    uploadFile,
                    request.datasetId,
                    request.fundingStreamId,
                    request.author.name,
                    request.author.id,
                    selectedDataSchema,
                    datasetSourceFileName,
                    description);
                if (uploadResponse.status !== 201) {
                    setValidationFailures({"error-message": ["Unable to upload file. Please check the file is valid and not locked."]});
                    setIsLoading(false);
                    return;
                }

                const validationResponse = await validateDatasetService(
                    request.datasetId,
                    request.fundingStreamId,
                    request.filename,
                    request.version.toString(),
                    false,
                    description,
                    "");

                if (validationResponse) {
                    const validateOperationId: any = validationResponse.data.operationId;
                    if (validateOperationId) {
                        return await getDatasetValidateStatus(validateOperationId)
                    }
                }
                setValidationFailures({"error-message": ["Failed to get validation progress tracking ID"]});
                setIsLoading(false);
            } catch (err) {
                setValidationFailures({"error-message": ["Unable to validate dataset: " + err.message]});
                setIsLoading(false);
            }
        } else {
            setValidateForm(prevState => {
                return {
                    ...prevState,
                    filenameValid: false
                }
            });
        }
    }

    function createDataset() {
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
                    nameValid: true,
                    filenameValid: true,
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
                        const response = error.response.data as NewDatasetVersionResponseErrorModel;
                        setErrorResponse(response);
                        setValidationFailures({"error-message": ["Unable to upload file. Please check the file is valid and not locked."]});
                    }
                    setIsLoading(false);
                });
        } else {
            if (request.name === "") {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        nameValid: false
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
                        filenameValid: false
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
                        nameValid: true
                    }
                })
            } else {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        nameValid: false
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
                        filenameValid: true
                    }
                })
            } else {
                setValidateForm(prevState => {
                    return {
                        ...prevState,
                        filenameValid: false
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
            setUploadFileName(file.name);
            setUploadFile(file);
        }
    }

    let uploadErrorMessage = "";
    if (errorResponse) {
        if (errorResponse.Name && errorResponse.Name.length > 0) {
            uploadErrorMessage += errorResponse.Name[0];
        }
        if (errorResponse.DefinitionId && errorResponse.DefinitionId.length > 0) {
            uploadErrorMessage += errorResponse.DefinitionId;
        }
    }

    function CreateDataSourceButton() {
        const isDisabled = missingPermissions.length > 0;
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
                <LoadingStatus title={loadingStatus} hidden={!isLoading}
                               subTitle={"Please wait whilst the data source is created"}/>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <PermissionStatus requiredPermissions={missingPermissions} hidden={permissions.length === 0}/>
                    </div>
                </div>
                <div hidden={(validationFailures === undefined || isLoading)}
                     className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert"
                     data-module="govuk-error-summary">
                    <h2 className="govuk-error-summary__title">
                        There is a problem
                    </h2>
                    {validationFailures && Object.keys(validationFailures).length > 0 &&
                    <div className="govuk-error-summary__body">
                        <ul className="govuk-list govuk-error-summary__list">
                            {Object.keys(validationFailures).map((errKey, index) =>
                                errKey === "blobUrl" ?
                                    <li key={index}>
                                        <span>Please see </span><a href={validationFailures["blobUrl"].toString()}>error report</a>
                                    </li>
                                    :
                                    <li key={index}>{validationFailures[errKey]}</li>
                            )}
                        </ul>
                    </div>}
                </div>
                <div className="govuk-grid-row" hidden={isLoading}>
                    <div className="govuk-grid-column-two-thirds">
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-3">Upload new data source</h1>
                        <p className="govuk-body">Load a new data source file to create a dataset to use in calculations.</p>
                        {uploadErrorMessage &&
                        <div className="govuk-form-group">
                            <ErrorSummary title={"Correct errors to continue with the process"}
                                          error={uploadErrorMessage}
                                          suggestion={""}/>
                        </div>}
                        <div className={"govuk-form-group" + (validateForm.fundingStreamValid ? "" : " govuk-form-group--error")}>
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
                                              disabled={fundingStreamIsLoading} />
                            }

                        </div>
                        <div className={"govuk-form-group" + (validateForm.dataDefinitionIdValid ? "" : " govuk-form-group--error")}>
                            <label className="govuk-label" htmlFor="sort">
                                Data schema
                            </label>
                            {dataSchemaIsLoading ? <LoadingFieldStatus title={"loading data schemas"}/> :
                                <AutoComplete suggestions={dataSchemaSuggestions.map(dss => dss.name)} 
                                              callback={updateDataSchemaSelection}
                                              disabled={dataSchemaIsLoading} />}

                        </div>

                        <div className={"govuk-form-group" + (validateForm.nameValid ? "" : " govuk-form-group--error")}>
                            <label className="govuk-label" htmlFor="address-line-1">
                                Dataset source file name
                            </label>
                            <span id="event-name-hint" className="govuk-hint">
                            Use a descriptive unique name other users can understand
                            </span>
                            <input className="govuk-input" id="dataset-source-filename" name="dataset-source-filename" type="text"
                                   onChange={(e) => setDatasetSourceFileName(e.target.value)}/>
                        </div>

                        <div className={"govuk-form-group" + (validateForm.descriptionValid ? "" : " govuk-form-group--error")}>
                            <label className="govuk-label" htmlFor="more-detail">
                                Description
                            </label>
                            <textarea className="govuk-textarea" id="more-detail" name="more-detail" rows={8} aria-describedby="more-detail-hint"
                                      onChange={(e) => setDescription(e.target.value)}/>
                        </div>

                        <div className={"govuk-form-group" + (validateForm.filenameValid ? "" : " govuk-form-group--error")}>
                            <div className="govuk-form-group">
                                <label className="govuk-label" htmlFor="file-upload-1">
                                    Upload data source file
                                </label>
                                {
                                    (validationFailures !== undefined) ?
                                        <span className="govuk-error-message">
                                        <span className="govuk-visually-hidden">Error:</span>
                                            {validationFailures["error-message"]}
                                            {validationFailures["FundingStreamId"]}
                                            {validationFailures["blobUrl"] != null &&
                                                <span><span> please see </span><a href={validationFailures["blobUrl"].toString()}>error report</a></span>
                                            }
                                    </span>
                                        : ""
                                }
                                <input className="govuk-file-upload" 
                                       id="file-upload-1" 
                                       name="file-upload-1" 
                                       type="file"
                                       onChange={storeFileUpload}/>
                            </div>
                        </div>
                        <CreateDataSourceButton/>
                        <Link to="/Datasets/ManageDataSourceFiles" className="govuk-button govuk-button--secondary" data-module="govuk-button">
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}