import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {assignDataSourceService, getDatasetBySpecificationIdService, getDatasourcesByRelationshipIdService} from "../../services/datasetService";
import {RouteComponentProps, useHistory} from "react-router";
import {DateFormatter} from "../../components/DateFormatter";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {LoadingStatus} from "../../components/LoadingStatus";
import {SelectDatasetResponseViewModel} from "../../types/Datasets/SelectDatasetResponseViewModel";
import {DatasourceRelationshipResponseViewModel} from "../../types/Datasets/DatasourceRelationshipResponseViewModel";
import {ErrorSummary} from "../../components/ErrorSummary";
import {Link} from "react-router-dom";

export interface SelectDataSourceRouteProps {
    specificationId: string
}

export function SelectDataSource({match}: RouteComponentProps<SelectDataSourceRouteProps>) {
    const [selectDatasets, setSelectDatasets] = useState<SelectDatasetResponseViewModel>({content: [], statusCode: 0});
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>({
        approvalStatus: "",
        description: "",
        fundingPeriod: {
            id: "",
            name: ""
        },
        fundingStreams: [],
        id: "",
        isSelectedForFunding: false,
        name: "",
        providerVersionId: ""
    })
    const [datasourceVersions, setDatasourceVersions] = useState<DatasourceRelationshipResponseViewModel>({
        datasets: [{
            name: "",
            id: "",
            selectedVersion: 0,
            versions: [{
                author: {
                    name: "",
                    id: ""
                },
                date: new Date(),
                id: "",
                version: 0
            }]
        }],
        definitionId: "",
        definitionName: "",
        relationshipId: "",
        relationshipName: "",
        specificationId: "",
        specificationName: ""
    });
    const [datasourceIsLoading, setDatasourceIsLoading] = useState<boolean>(true);
    const [selectedVersion, setSelectedVersion] = useState<string>("");
    const [errorState, setErrorState] = useState<boolean>(false);
    const [saveErrorState, setSaveErrorState] = useState<boolean>(false);

    let history = useHistory();

    useEffectOnce(() => {
        getSpecificationSummaryService(match.params.specificationId).then((response) => {
            if (response.status === 200) {
                const result = response.data as SpecificationSummary;
                setSpecificationSummary(result);
            }
        });
        getDatasetBySpecificationIdService(match.params.specificationId).then((response) => {
            if (response.status === 200) {
                const result = response.data as SelectDatasetResponseViewModel;
                setSelectDatasets(result);
                setDatasourceIsLoading(false);
            }
        });
    });

    function populateVersions(e: React.ChangeEvent<HTMLInputElement>) {
        const relationshipId = e.target.value;
        getDatasourcesByRelationshipIdService(relationshipId).then((response) => {
            if (response.status === 200) {
                const result = response.data as DatasourceRelationshipResponseViewModel;
                setDatasourceVersions(result);
            }
        });
    }

    function changeSelection() {
        history.goBack();
    }

    function saveSelection(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.checked) {
            const selectedItem = e.target.value;
            setSelectedVersion(selectedItem);
        }
    }

    function saveVersion() {
        if (selectedVersion !== "") {
            setErrorState(false);
            setSaveErrorState(false);
            assignDataSourceService(datasourceVersions.relationshipId, specificationSummary.id, selectedVersion).then((response) => {
                    if (response.status === 200) {
                        history.push("");
                    } else {
                        setErrorState(true);
                    }
                }).catch((e) => {
                    setSaveErrorState(true);
            });
        }
    }

    return (<div>
            <Header location={Section.Datasets}/>
            <div className="govuk-width-container">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full" hidden={specificationSummary.name === ""}>
                        <Breadcrumbs>
                            <Breadcrumb name={"Calculate funding"} url={"/"}/>
                            <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"}/>
                            <Breadcrumb name={"Map data source files to datasets for a specification"} url={"/Datasets/MapDataSourceFiles"}/>
                            <Breadcrumb name={specificationSummary.name} url={`/Datasets/DataRelationships/${specificationSummary.id}`}/>
                            <Breadcrumb name={`Change ${specificationSummary.name}`}/>
                        </Breadcrumbs>
                    </div>
                </div>
                <div className="govuk-grid-row" hidden={!datasourceIsLoading}>
                    <div className="govuk-grid-column-full">
                        <LoadingStatus title={"Loading datasources"}/>
                    </div>
                </div>
                <div className="govuk-grid-row" hidden={datasourceIsLoading}>

                    <div className="govuk-grid-column-full">
                        <h1 className="govuk-heading-xl">
                            {specificationSummary.name}
                            <span className="govuk-caption-xl">{specificationSummary.fundingPeriod.name}</span>
                        </h1>
                        <div className="govuk-form-group">
                            <div hidden={!errorState}>
                                <ErrorSummary title={"Please select a version"} error={"No selection has been made"} suggestion={"No version is selected. Please select a version to apply."}/>
                            </div>
                            <div hidden={!saveErrorState}>
                                <ErrorSummary title={"Error"} error={"An error was encountered whilst trying to save changes"} suggestion={"Please check and try again."}/>
                            </div>

                        </div>
                        <div className="govuk-form-group" hidden={datasourceIsLoading}>
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h4 className="govuk-heading-s">Select data source file</h4>
                                </legend>
                                <span id="select-one-option" className="govuk-hint">
      Select one option.
    </span>
                                <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                                    {selectDatasets.content.map(d =>
                                            <>
                                                <div className="govuk-radios__item">
                                                    <input className="govuk-radios__input" id={`dataset-${d.id}`} name={`dataset-options`} type="radio" value={d.id} aria-controls="conditional-master-dataset-option-conditional" aria-expanded="false" onChange={(e) => populateVersions(e)}/>
                                                    <label className="govuk-label govuk-radios__label" htmlFor={`dataset-${d.id}`}>
                                                        {d.datasetName}
                                                        <span className="govuk-hint">
                                        <strong>Description:</strong> {d.relationshipDescription}
                                        </span>
                                                    </label>
                                                </div>
                                                <div className="govuk-radios__conditional" id="dataset-datasource-radioset" hidden={datasourceVersions.datasets === null || datasourceVersions.datasets.filter(x => x.id === d.datasetId).length === 0}>
                                                    <div className="govuk-form-group">
                                                        <fieldset className="govuk-fieldset">
                                                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                                                <h4 className="govuk-heading-s">Select data source version</h4>
                                                            </legend>
                                                            <div className="govuk-radios govuk-radios--small">
                                                                {datasourceVersions.datasets !== null ? datasourceVersions.datasets.slice(0, 5).map((ds, index) =>
                                                                        <div className="govuk-radios__item" key={index}>
                                                                            <input className="govuk-radios__input" id={`datasource-${ds.id}`} name={`datasource-${ds.id}`} type="radio" value={ds.id} onChange={(e) => saveSelection(e)}/>
                                                                            <label className="govuk-label govuk-radios__label" htmlFor={`datasource-${ds.id}`}>
                                                                                {ds.name}
                                                                                <div className="govuk-!-margin-top-1">
                                                                                    <details className="govuk-details  summary-margin-removal" data-module="govuk-details">
                                                                                        <div className="govuk-details__text summary-margin-removal">
                                                                                            <p className="govuk-body-s">
                                                                                                <strong>Version notes:</strong>
                                                                                            </p>
                                                                                            <p className="govuk-body-s">
                                                                                                <strong>Last updated:</strong> <DateFormatter date={ds.versions[0].date} utc={true}/></p>
                                                                                            <p className="govuk-body-s">
                                                                                                <strong>Last updated by:</strong> {ds.versions[0].author.name}
                                                                                            </p>
                                                                                        </div>
                                                                                    </details>
                                                                                </div>
                                                                            </label>
                                                                        </div>
                                                                ) : ""}
                                                            </div>
                                                        </fieldset>
                                                    </div>
                                                    <p className="govuk-body govuk-!-margin-top-5" hidden={datasourceVersions.datasets === null || datasourceVersions.datasets.length <= 5}>
                                                        <Link to={`/Datasets/SelectDataSourceExpanded/${specificationSummary.id}/${d.datasetId}`} className="govuk-link">View {datasourceVersions.datasets !== null ? datasourceVersions.datasets.length - 5 : ""} more versions</Link>
                                                    </p>
                                                </div>
                                            </>
                                    )}
                                </div>
                            </fieldset>
                        </div>
                        <div className="govuk-form-group" hidden={datasourceIsLoading}>
                        <button className="govuk-button govuk-!-margin-right-1" onClick={saveVersion} disabled={selectedVersion === ""}>Save</button>
                        <button className="govuk-button govuk-button--secondary" onClick={changeSelection}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}