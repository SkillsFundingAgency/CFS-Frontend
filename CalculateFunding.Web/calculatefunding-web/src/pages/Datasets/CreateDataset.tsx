import React, {useEffect, useState} from "react";
import {RouteComponentProps, useHistory} from "react-router";
import {Header} from "../../components/Header";
import {assignDatasetSchemaService, getDatasetsForFundingStreamService} from "../../services/datasetService";
import {LoadingStatus} from "../../components/LoadingStatus";
import {ConfirmationPanel} from "../../components/ConfirmationPanel";
import {Section} from "../../types/Sections";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {DataschemaDetailsViewModel} from "../../types/Datasets/DataschemaDetailsViewModel";
import {Footer} from "../../components/Footer";
import {ProviderSource} from "../../types/CoreProviderSummary";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {useFundingConfiguration} from "../../hooks/useFundingConfiguration";
import {useErrors} from "../../hooks/useErrors";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {AxiosError} from "axios";
import {useMutation, useQuery} from "react-query";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {AssignDatasetSchemaRequest} from "../../types/Datasets/AssignDatasetSchemaRequest";

interface CreateDatasetPageRoute {
    specificationId: string
}

export function CreateDataset({match}: RouteComponentProps<CreateDatasetPageRoute>) {
    const specificationId = match.params.specificationId;
    const history = useHistory();
    const {errors, addError, clearErrorMessages} = useErrors();
    const {specification, isLoadingSpecification} =
        useSpecificationSummary(specificationId, err => addError(err, "Error while loading specification"));
    const fundingPeriodId = specification && specification.fundingPeriod.id;
    const fundingStreamId = specification && specification.fundingStreams[0].id;
    const {fundingConfiguration, isLoadingFundingConfiguration} =
        useFundingConfiguration(fundingStreamId, fundingPeriodId,
            err => addError(err, "Error while loading funding configuration"));
    const {data: dataSchemas, isLoading: isLoadingDataSchemas} =
        useQuery<DataschemaDetailsViewModel[], AxiosError>(`data-schemas-for-stream-${fundingStreamId}`,
            async () => (await getDatasetsForFundingStreamService(fundingStreamId as string)).data,
            {
                enabled: fundingStreamId !== undefined,
                onError: err => addError(err, "Error while loading available data schemas")
            });
    const [assignDatasetSchema, {isLoading: isUpdating, isSuccess}] =
        useMutation<boolean, AxiosError, AssignDatasetSchemaRequest>(
            async (request) => (await assignDatasetSchemaService(request)).data,
            {
                onError: err => addError(err, "Error while trying to assign dataset schema"),
                onSuccess: data => {
                    if (updateRequest && updateRequest.addAnotherAfter) {
                        clearFormData();
                    } else {
                        history.push(`/ViewSpecification/${specificationId}?showDatasets=true`)
                    }
                }
            });
    const [updateRequest, setUpdateRequest] = useState<AssignDatasetSchemaRequest>();
    const [isSetAsProviderData, setIsSetAsProviderData] = useState<boolean>(false);
    const [datasetName, setDatasetName] = useState({
        name: "",
        isValid: true
    });
    const [datasetDescription, setDatasetDescription] = useState({
        description: "",
        isValid: true
    });

    const [datasetDataSchema, setDatasetDataschema] = useState({
        value: "",
        isValid: true
    });

    document.title = "Specification Results - Calculate funding";


    function changeDataSchema(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value.trim();

        setDatasetDataschema(prevState => {
            return {
                ...prevState, value: value, isValid: value !== ""
            }
        });
    }

    function changeDatasetName(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value.trim();

        setDatasetName(prevState => {
            return {
                ...prevState, name: value, isValid: value !== ""
            }
        });
    }

    function changeDatasetDescription(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const value = e.target.value.trim();

        setDatasetDescription(prevState => {
            return {
                ...prevState, description: value, isValid: value !== ""
            }
        });
    }

    const saveDataset = async (continueAddingAfter: boolean) => {
        clearErrorMessages();

        const valid = checkSubmission();

        if (valid) {
            const request: AssignDatasetSchemaRequest = {
                name: datasetName.name,
                description: datasetDescription.description,
                datasetDefinitionId: datasetDataSchema.value,
                specificationId,
                isSetAsProviderData,
                addAnotherAfter: continueAddingAfter
            };
            setUpdateRequest(request);
        }
    }

    function checkSubmission() {
        const isDatasetNameValid = datasetName.name !== "";
        const isDatasetDataSchemaValid = datasetDataSchema.value !== "";
        const isDatasetDescriptionValid = datasetDescription.description !== "";

        if (datasetName.isValid !== isDatasetNameValid) {
            setDatasetName(prevState => {
                return {
                    ...prevState, isValid: isDatasetNameValid
                }
            });
        }

        if (datasetDataSchema.isValid !== isDatasetDataSchemaValid) {
            setDatasetDataschema(prevState => {
                return {...prevState, isValid: isDatasetDataSchemaValid}
            })
        }

        if (datasetDescription.isValid !== isDatasetDescriptionValid) {
            setDatasetDescription(prevState => {
                return {...prevState, isValid: isDatasetDescriptionValid}
            })
        }

        return (isDatasetNameValid && isDatasetDataSchemaValid && isDatasetDescriptionValid);
    }

    function clearFormData() {
        setDatasetDescription({description: "", isValid: true});
        setDatasetName({name: "", isValid: true});
        setDatasetDataschema({value: "", isValid: true});
        setIsSetAsProviderData(false);

        // @ts-ignore
        document.getElementById('save-dataset-form').reset();
    }
    
    useEffect(() => {
        if (updateRequest) {
            assignDatasetSchema(updateRequest);
        }
    }, [updateRequest])

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Specifications"} url={"/SpecificationsList"}/>
                <Breadcrumb name={specification ? specification.name : "specification"} url={`/ViewSpecification/${specificationId}`}/>
                <Breadcrumb name={"Create dataset"}/>
            </Breadcrumbs>

            <ConfirmationPanel title={"Dataset created"} 
                               body={`Dataset ${updateRequest?.name} has been created.`} 
                               hidden={!isSuccess}/>
            
            <MultipleErrorSummary errors={errors}/>

            {(isLoadingSpecification || isLoadingFundingConfiguration || isUpdating) &&
            <LoadingStatus title={isLoadingSpecification ? "Loading specification" :
                isLoadingFundingConfiguration ? "Loading funding configuration" :
                    isUpdating ? "Creating Dataset" : "Loading"}
                           id={"create-dataset-loader"}
                           subTitle="Please wait"
                           description={isUpdating ? "This can take a few minutes" : ""}/>
            }

            {!isUpdating && specification && fundingConfiguration &&
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <form id="save-dataset-form">
                        <fieldset className="govuk-fieldset">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <h3 className="govuk-caption-xl">{specification.name}</h3>
                                <h1 className="govuk-fieldset__heading">
                                    Create dataset
                                </h1>
                            </legend>

                            <div className={"govuk-form-group" + (datasetDataSchema.isValid ? "" : " govuk-form-group--error")}>
                                <label className="govuk-label" htmlFor="select-data-schema">
                                    Select data schema
                                </label>
                                {isLoadingDataSchemas && <LoadingFieldStatus title={"Loading..."}/>}
                                {dataSchemas &&
                                <select id={"select-data-schema"}
                                        className="govuk-select"
                                        name="select-data-schema"
                                        aria-describedby="select-data-schema-hint"
                                        onChange={(e) => changeDataSchema(e)}>
                                    <option key={-1} value="">Please select</option>
                                    )
                                    {dataSchemas.map((d, index) =>
                                        <option key={index} value={d.id}>{d.name}</option>)
                                    }
                                </select>
                                }
                                <div hidden={datasetDataSchema.isValid || isLoadingDataSchemas}>
                                    <span id="select-data-schema-hint" className="govuk-error-message">Please select a data schema</span>
                                </div>
                            </div>

                            <div className={"govuk-form-group" + (datasetName.isValid ? "" : " govuk-form-group--error")}>
                                <label className="govuk-label" htmlFor="dataset-name">
                                    Dataset name
                                </label>
                                <span id="event-name-hint" className="govuk-hint">
                                    Use a descriptive unique name other users can understand
                                </span>
                                <input className="govuk-input"
                                       id="dataset-name"
                                       name="dataset-name"
                                       aria-describedby="dataset-name-error"
                                       type="text"
                                       onChange={(e) => changeDatasetName(e)}/>
                                <div hidden={datasetName.isValid}>
                                    <span id="dataset-name-error" className="govuk-error-message">
                                        Please provide a name for the dataset
                                    </span>
                                </div>
                            </div>

                            <div className={"govuk-form-group" + (datasetDescription.isValid ? "" : " govuk-form-group--error")}>
                                <label className="govuk-label" htmlFor="dataset-description">
                                    Description
                                </label>
                                <textarea className="govuk-textarea"
                                          id="dataset-description"
                                          name="dataset-description"
                                          rows={8}
                                          aria-describedby="dataset-description-hint"
                                          onChange={(e) => changeDatasetDescription(e)}/>
                                <div hidden={datasetDescription.isValid}>
                                    <span id="dataset-description-hint" className="govuk-error-message">
                                        Please provide a description for the dataset
                                    </span>
                                </div>
                            </div>

                            {fundingConfiguration && fundingConfiguration.providerSource === ProviderSource.CFS &&
                            <div className="govuk-form-group">
                                <fieldset className="govuk-fieldset">
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                        <h3 className="govuk-heading-m">
                                            Set as provider data
                                        </h3>
                                    </legend>
                                    <div className="govuk-radios govuk-radios--inline">
                                        <div className="govuk-radios__item">
                                            <input className="govuk-radios__input"
                                                   id="set-as-data-provider-yes"
                                                   name="set-as-data-provider"
                                                   type="radio"
                                                   value="true"
                                                   onChange={() => setIsSetAsProviderData(true)}/>
                                            <label className="govuk-label govuk-radios__label"
                                                   htmlFor="set-as-data-provider-yes">
                                                Yes
                                            </label>
                                        </div>
                                        <div className="govuk-radios__item">
                                            <input className="govuk-radios__input"
                                                   id="set-as-data-provider-no"
                                                   name="set-as-data-provider"
                                                   type="radio"
                                                   value="false"
                                                   onChange={() => setIsSetAsProviderData(false)}/>
                                            <label className="govuk-label govuk-radios__label"
                                                   htmlFor="set-as-data-provider-no">
                                                No
                                            </label>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                            }
                        </fieldset>
                    </form>
                    <button className="govuk-button govuk-!-margin-right-1"
                            data-module="govuk-button"
                            onClick={() => saveDataset(false)}>
                        Save and continue
                    </button>
                    <button className="govuk-button govuk-button--secondary"
                            data-module="govuk-button"
                            onClick={() => saveDataset(true)}>
                        Save and add another
                    </button>
                    <Link to={`/ViewSpecification/${specificationId}`}
                          className="govuk-button govuk-button--warning govuk-!-margin-left-1"
                          data-module="govuk-button">
                        Cancel
                    </Link>
                </div>
            </div>
            }
        </div>
        <Footer/>
    </div>
}