import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {assignDataSourceService, getExpandedDataSources} from "../../services/datasetService";
import {RouteComponentProps, useHistory} from "react-router";
import {DateFormatter} from "../../components/DateFormatter";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {LoadingStatus} from "../../components/LoadingStatus";
import {Content} from "../../types/Datasets/SelectDatasetResponseViewModel";
import {ErrorSummary} from "../../components/ErrorSummary";
import {DatasetRelationshipPagedResponseViewModel} from "../../types/Datasets/DatasetRelationshipPagedResponseViewModel";
import Pagination from "../../components/Pagination";
import {SearchMode} from "../../types/SearchMode";
import {DatasourceVersionSearchModel} from "../../types/Datasets/DatasourceVersionSearchModel";
import {Footer} from "../../components/Footer";

export interface SelectDataSourceExpandedRouteProps {
    specificationId: string;
    datasetId: string;
    relationshipId:string
}

export function SelectDataSourceExpanded({match}: RouteComponentProps<SelectDataSourceExpandedRouteProps>) {
    const initialSearchRequest: DatasourceVersionSearchModel = {
        pageNumber: 1,
        top: 5,
        searchTerm: "",
        errorToggle: false,
        orderBy: [],
        filters: {"": [""]},
        includeFacets: true,
        facetCount: 1,
        countOnly: false,
        searchMode: SearchMode.All,
        searchFields: [],
        overrideFacetFields: []
    };
    const [searchRequest, setSearchRequest] = useState<DatasourceVersionSearchModel>(initialSearchRequest);
    const [selectedDataset, setSelectedDataset] = useState<Content>({
        datasetId: "",
        datasetName: "",
        definition: {
            description: "",
            id: "",
            name: ""
        },
        id: "",
        isLatestVersion: false,
        isProviderData: false,
        name: "",
        relationshipDescription: "",
        version: 0
    });
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>({
        approvalStatus: "",
        description: "",
        fundingPeriod: {
            id: "",
            name: ""
        },
        fundingStreams: [{
            id: "",
            name: ""
        }],
        id: "",
        isSelectedForFunding: false,
        name: "",
        providerVersionId: ""
    })
    const [datasourceVersions, setDatasourceVersions] = useState<DatasetRelationshipPagedResponseViewModel>({
        endItemNumber: 0,
        facets: [],
        items: [],
        pagerState: {
            previousPage: 0,
            nextPage: 0,
            displayNumberOfPages: 0,
            pages: [],
            currentPage: 0,
            lastPage: 0
        },
        description:"",
        id:"",
        name:"",
        startItemNumber: 0,
        totalCount: 0
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

            populateExpandedDatasources(match.params.datasetId, searchRequest);
            }
            setDatasourceIsLoading(false);
        });
    });

    function changeSelection() {
        history.goBack();
    }

    function populateExpandedDatasources(relationshipId: string, searchRequest: DatasourceVersionSearchModel) {
        getExpandedDataSources(match.params.relationshipId, match.params.datasetId, searchRequest).then((response) => {
            if (response.status === 200) {
                const result = response.data as DatasetRelationshipPagedResponseViewModel;
                setDatasourceVersions(result);
            }
        });
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
            assignDataSourceService(match.params.datasetId, specificationSummary.id, selectedVersion).then((response) => {
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

    function setPagination(e: number) {
        let search = searchRequest;
        search.pageNumber = e;
        setSearchRequest(search);
        populateExpandedDatasources(match.params.datasetId, searchRequest);
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
                        <h3 className="govuk-heading-m">
                            {selectedDataset.name}
                            <span className="govuk-hint">
                                <strong>Description:</strong> {specificationSummary.description}
                            </span>
                        </h3>
                        <div className="govuk-form-group">
                            <div hidden={!errorState}>
                                <ErrorSummary title={"Please select a version"} error={"No selection has been made"} suggestion={"No version is selected. Please select a version to apply."}/>
                            </div>
                            <div hidden={!saveErrorState}>
                                <ErrorSummary title={"Error"} error={"An error was encountered whilst trying to save changes"} suggestion={"Please check and try again."}/>
                            </div>
                        </div>
                        <div className="govuk-form-group">
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-radios">
                                    <div className="govuk-form-group">
                                        <fieldset className="govuk-fieldset">
                                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                                <h4 className="govuk-heading-s">Select data source version</h4>
                                                <span id="select-one-option" className="govuk-hint">
                                                  Select one option.
                                                </span>
                                            </legend>

                                            <div className="govuk-radios govuk-radios--small">
                                                {datasourceVersions.items.map(v =>
                                                        <div className="govuk-radios__item">
                                                            <input className="govuk-radios__input" id={`datasource-${v.version}`} name={`datasource-${v.version}`} type="radio" value={`${datasourceVersions.id}_${v.version}`} onChange={(e) => saveSelection(e)}/>
                                                            <label className="govuk-label govuk-radios__label" htmlFor={`datasource-${v.version}`}>
                                                                {datasourceVersions.name} (Version {v.version})
                                                                <div className="govuk-!-margin-top-1">
                                                                    <details className="govuk-details summary-margin-removal" data-module="govuk-details">
                                                                        <summary className="govuk-details__summary">
                      <span className="govuk-details__summary-text">
                        Version details
                      </span>
                                                                        </summary>
                                                                        <div className="govuk-details__text">
                                                                            <p className="govuk-body-s">
                                                                                <strong>Last updated:</strong>
                                                                                <DateFormatter date={v.date} utc={false}/>
                                                                            </p>
                                                                            <p className="govuk-body-s">
                                                                                <strong>Last updated by:</strong> {v.author.name}
                                                                            </p>
                                                                        </div>
                                                                    </details>
                                                                </div>
                                                            </label>
                                                        </div>
                                                )}
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                        <div className="govuk-form-group">
                            <div className="pagination__summary">Showing {datasourceVersions.startItemNumber} - {datasourceVersions.endItemNumber} of {datasourceVersions.totalCount} results</div>
                            <Pagination currentPage={datasourceVersions.pagerState.currentPage} lastPage={datasourceVersions.pagerState.lastPage} callback={setPagination}/>
                            <button className="govuk-button govuk-!-margin-right-1" disabled={selectedVersion === ""} onClick={saveVersion}>Save</button>
                            <button className="govuk-button govuk-button--secondary" onClick={changeSelection}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}