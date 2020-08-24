import React, {useEffect, useState} from "react";
import {RouteComponentProps, useHistory} from "react-router";
import {Header} from "../../components/Header";
import {assignDatasetSchemaUpdateService, getDatasetsForFundingStreamService} from "../../services/datasetService";
import {LoadingStatus} from "../../components/LoadingStatus";
import {ConfirmationPanel} from "../../components/ConfirmationPanel";
import {Section} from "../../types/Sections";
import {Link} from "react-router-dom";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {DataschemaDetailsViewModel} from "../../types/Datasets/DataschemaDetailsViewModel";
import {Footer} from "../../components/Footer";

interface CreateDatasetPageRoute {
    specificationId: string
}

export function CreateDataset({match}: RouteComponentProps<CreateDatasetPageRoute>) {
    const specificationId = match.params.specificationId;
    let history = useHistory();

    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>({
        approvalStatus: "",
        description: "",
        fundingPeriod: {
            name: "",
            id: ""
        },
        fundingStreams: [],
        id: "",
        isSelectedForFunding: false,
        name: "",
        providerVersionId: ""
    })
    const [dataSchemas, setDataSchemas] = useState<DataschemaDetailsViewModel[]>([{
        id: "",
        name: "",
        description: ""
    }]);

    const [datasetAsDataProvider, setDatasetAsDataProvider] = useState<boolean>(false);
    const [datasetName, setDatasetName] = useState({
        name: "",
        isValid: true
    });
    const [datasetDescription, setDatasetDescription] = useState({
        description: "",
        isValid: true
    });

    const [datasetDataschema, setDatasetDataschema] = useState({
        value: "",
        isValid: true
    });

    const [saveDatasetResult, setSaveDatasetResult] = useState({
        result: false,
        attempted: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [addAnother, setAddAnother] = useState(false);

    useEffect(() => {
        document.title = "Specification Results - Calculate funding";

        getSpecificationSummaryService(match.params.specificationId).then((response) => {
            if (response.status === 200) {
                let result = response.data as SpecificationSummary
                setSpecificationSummary(result);
                getDatasetsForFundingStreamService(result.fundingStreams[0].id).then((response) => {
                    if (response.status === 200) {
                        setDataSchemas(response.data as DataschemaDetailsViewModel[]);
                    }
                })
            }
        })
    }, [specificationId]);

    function setAsDataProvider(e: React.ChangeEvent<HTMLInputElement>) {
        setDatasetAsDataProvider(Boolean(JSON.parse(e.target.value)));
    }

    function changeDataschema(e: React.ChangeEvent<HTMLSelectElement>) {
        const name = e.target.value.trim();

        if (name != null) {
            setDatasetDataschema(prevState => {
                return {
                    ...prevState, value: name, isValid: name !== ""
                }
            })
        } else {
            setDatasetDataschema(prevState => {
                return {
                    ...prevState, isValid: false
                }
            });
        }
    }

    function changeDatasetName(e: React.ChangeEvent<HTMLInputElement>) {
        const name = e.target.value.trim();

        if (name != null) {
            setDatasetName(prevState => {
                return {
                    ...prevState, name: name, isValid: name !== ""
                }
            })
        } else {
            setDatasetName(prevState => {
                return {
                    ...prevState, isValid: false
                }
            });
        }
    }

    function changeDatasetDescription(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const name = e.target.value.trim();

        if (name != null) {
            setDatasetDescription(prevState => {
                return {
                    ...prevState, description: name, isValid: name !== ""
                }
            })
        } else {
            setDatasetDescription(prevState => {
                return {
                    ...prevState, isValid: false, name: ""
                }
            });
        }
    }

    function saveDataset(addAnother: boolean) {
        setAddAnother(false);
        setIsLoading(true);
        const valid = checkSubmission();

        if (valid) {
            const result = async (): Promise<boolean> => {
                const response = await assignDatasetSchemaUpdateService(datasetName.name, datasetDescription.description, datasetDataschema.value, specificationId, datasetAsDataProvider);
                return response.data;
            };

            result().then((success) => {
                setSaveDatasetResult(prevState => {
                    return {
                        ...prevState, result: success, attempted: true
                    }
                });
                if (addAnother) {
                    clearFormData();
                    setAddAnother(true);
                } else {
                    history.push(`/ViewSpecification/${specificationId}`)
                }
            }).catch(() => {
                setSaveDatasetResult(prevState => {
                    return {
                        ...prevState, result: false, attempted: true
                    }
                });
            }).finally(() => {
                setIsLoading(false)
            })
        }
        setIsLoading(false);
    }

    function checkSubmission() {
        if (datasetName.name === "") {
            setDatasetName(prevState => {
                return {
                    ...prevState, isValid: false
                }
            });
        }

        if (datasetDataschema.value === "") {
            setDatasetDataschema(prevState => {
                return {...prevState, isValid: false}
            })
        }

        if (datasetDescription.description === "") {
            setDatasetDescription(prevState => {
                return {...prevState, isValid: false}
            })
        }

        return (datasetName.isValid && datasetDescription.isValid && datasetDataschema.isValid);
    }

    function clearFormData() {
        setDatasetDescription({description: "", isValid: true});
        setDatasetName({name: "", isValid: true});
        setDatasetDataschema({value: "", isValid: true});
        setDatasetAsDataProvider(false);
        setSaveDatasetResult({result: false, attempted: false});

        // @ts-ignore
        document.getElementById('save-dataset-form').reset();
    }

    return <div>
        <Header location={Section.Specifications}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Specifications"} url={"/SpecificationsList"}/>
                <Breadcrumb name={specificationSummary.name} url={`/ViewSpecification/${specificationId}`}/>
                <Breadcrumb name={"Create dataset"}/>
            </Breadcrumbs>
            <ConfirmationPanel title={"Dataset created"} body={"Your dataset has been created."} hidden={!addAnother}/>
            <LoadingStatus title={"Creating Dataset"} hidden={!isLoading} id={"create-dataset-loader"}
                           subTitle={"Please wait whilst your dataset is created"}
                           description={"This can take a few minutes"}/>
            <div className="govuk-grid-row" hidden={isLoading}>
                <div className="govuk-grid-column-full">
                    <fieldset className="govuk-fieldset">
                        <form id={"save-dataset-form"}>
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                <span className="govuk-caption-xl">{specificationSummary.name}</span>
                                <h1 className="govuk-heading-xl">Create dataset</h1>
                            </legend>

                            <div className={"govuk-form-group" + (datasetDataschema.isValid ? "" : " govuk-form-group--error")}>
                                <label className="govuk-label" htmlFor="sort">
                                    Select data schema
                                </label>
                                <select className="govuk-select" id="sort" name="sort"
                                        onChange={(e) => changeDataschema(e)}>
                                    <option key={-1} value="">Please select</option>
                                    )
                                    {dataSchemas.map((d, index) =>
                                        <option key={index} value={d.id}>{d.name}</option>)
                                    }
                                </select>
                                <div hidden={datasetDataschema.isValid}>
                                <span id="dataset-name-error"
                                      className="govuk-error-message">Please select a data schema</span>
                                </div>
                            </div>

                            <div className={"govuk-form-group" + (datasetName.isValid ? "" : " govuk-form-group--error")}>
                                <label className="govuk-label" htmlFor="address-line-1">
                                    Dataset name
                                </label>
                                <span id="event-name-hint" className="govuk-hint">
                                    Use a descriptive unique name other users can understand
                                </span>
                                <input className="govuk-input" id="address-line-1" name="address-line-1" type="text"
                                       onChange={(e) => changeDatasetName(e)}/>
                                <div hidden={datasetName.isValid}>
                                <span id="dataset-name-error" className="govuk-error-message">
                                    Please provide a name for the dataset
                                </span>
                                </div>
                            </div>

                            <div className={"govuk-form-group" + (datasetDescription.isValid ? "" : " govuk-form-group--error")}>
                                <label className="govuk-label" htmlFor="more-detail">
                                    Description
                                </label>
                                <textarea className="govuk-textarea" id="more-detail" name="more-detail" rows={8}
                                          aria-describedby="more-detail-hint"
                                          onChange={(e) => changeDatasetDescription(e)}/>
                                <div hidden={datasetDescription.isValid}>
                                <span id="dataset-description-error" className="govuk-error-message">
                                    Please provide a description for the dataset
                                </span>
                                </div>
                            </div>

                            <div className="govuk-form-group">
                                <fieldset className="govuk-fieldset" aria-describedby="changed-name-hint">
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                                        <h3 className="govuk-heading-m">
                                            Set as provider data
                                        </h3>
                                    </legend>
                                    <div className="govuk-radios govuk-radios--inline">
                                        <div className="govuk-radios__item">
                                            <input className="govuk-radios__input" id="changed-name"
                                                   name="set-as-data-provider"
                                                   type="radio"
                                                   value="true" onChange={(e) => setAsDataProvider(e)}/>
                                            <label className="govuk-label govuk-radios__label"
                                                   htmlFor="set-as-data-provider-yes">
                                                Yes
                                            </label>
                                        </div>
                                        <div className="govuk-radios__item">
                                            <input className="govuk-radios__input" id="changed-name-2"
                                                   name="set-as-data-provider"
                                                   type="radio"
                                                   value="false" onChange={(e) => setAsDataProvider(e)}/>
                                            <label className="govuk-label govuk-radios__label"
                                                   htmlFor="set-as-data-provider-yes">
                                                No
                                            </label>
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
                        </form>
                    </fieldset>
                    <button className="govuk-button govuk-!-margin-right-1" data-module="govuk-button"
                            onClick={() => saveDataset(false)}>
                        Save and continue
                    </button>
                    <button className="govuk-button govuk-button--secondary" data-module="govuk-button"
                            onClick={() => saveDataset(true)}>Save and add another
                    </button>
                    <Link to={`/ViewSpecification/${specificationId}`}
                          className="govuk-button govuk-button--warning govuk-!-margin-left-1"
                          data-module="govuk-button">Cancel</Link>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}