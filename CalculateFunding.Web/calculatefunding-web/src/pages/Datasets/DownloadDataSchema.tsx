import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {searchDatasetDefinitionsService} from "../../services/datasetService";
import {DatasetDefinitionRequestViewModel} from "../../types/Datasets/DatasetDefinitionRequestViewModel";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {DatasetDefinitionResponseViewModel} from "../../types/Datasets/DatasetDefinitionResponseViewModel";
import {DateFormatter} from "../../components/DateFormatter";
import Pagination from "../../components/Pagination";
import {Footer} from "../../components/Footer";
import {LoadingStatus} from "../../components/LoadingStatus";
import {WarningText} from "../../components/WarningText";
import {BackToTop} from "../../components/BackToTop";
import {SearchMode} from "../../types/SearchMode";
import {NoData} from "../../components/NoData";

export function DownloadDataSchema() {

    const [searchRequest, setSearchRequest] = useState<DatasetDefinitionRequestViewModel>({
        pageNumber: 1,
        includeFacets: false,
        searchTerm: "",
        pageSize: 50,
        errorToggle: "",
        facetCount: 0,
        filters: [],
        searchMode: SearchMode.All
    })
    const [datasetDefinitions, setDatasetDefinitions] = useState<DatasetDefinitionResponseViewModel>({
        currentPage: 0,
        datasetDefinitions: [],
        endItemNumber: 0,
        facets: [],
        pagerState: {
            currentPage: 0,
            displayNumberOfPages: 0,
            lastPage: 0,
            nextPage: 0,
            pages: [],
            previousPage: 0
        },
        startItemNumber: 0,
        totalErrorResults: 0,
        totalResults: 0
    });
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffectOnce(() => {
        if (searchRequest !== undefined)
            searchDatasetDefinitions(searchRequest)
    });

    function searchDatasetDefinitions(searchRequestViewModel: DatasetDefinitionRequestViewModel) {
        setIsLoading(true);
        searchDatasetDefinitionsService(searchRequestViewModel).then((response) => {
            setDatasetDefinitions(response.data);
            setIsLoading(false);
        })
    }

    function setPagination(e: number) {
        let request = searchRequest;
        request.pageNumber = e;
        setSearchRequest(prevState => {
            return {...prevState, pageNumber: e}
        });
        searchDatasetDefinitions(request);
    }

    function searchDefinitions() {
        let request = searchRequest;
        request.searchTerm = searchTerm;
        setSearchRequest(prevState => {
            return {...prevState, searchTerm: searchTerm}
        });
        searchDatasetDefinitions(request);
    }

    return <div>
        <Header location={Section.Datasets}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"}/>
                <Breadcrumb name={"Download data schema template"}/>
            </Breadcrumbs>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <h1 className="govuk-heading-xl">Download data schema template</h1>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <div className="govuk-form-group search-container">
                        <label className="govuk-label" htmlFor="event-name">
                            Search data schema templates
                        </label>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-two-thirds">
                                <input className="govuk-input input-search" id="event-name" name="event-name" type="text" onChange={(e) => setSearchTerm(e.target.value)}/>
                            </div>
                            <div className="govuk-grid-column-one-third">
                                <button id={'submit-search'} className="govuk-button" type="submit" onClick={searchDefinitions}>Search</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <LoadingStatus title={"Loading data schema"} hidden={!isLoading}/>
            <div className="govuk-grid-row" hidden={isLoading}>
                <div className="govuk-grid-column-full">
                    <NoData hidden={datasetDefinitions.totalResults > 0} />
                    <table className="govuk-table" hidden={datasetDefinitions.totalResults === 0}>
                        <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                            <th scope="col" className="govuk-table__header">Data schema template</th>
                            <th scope="col" className="govuk-table__header text-stretch">Last updated</th>
                            <th scope="col" className="govuk-table__header">Download</th>
                        </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                        {datasetDefinitions.datasetDefinitions.map((d, index) =>
                            <tr className="govuk-table__row" key={index}>
                                <th scope="row" className="govuk-table__header"><p>{d.name}</p>
                                    <div className="govuk-!-margin-top-2">

                                        <details className="govuk-details govuk-!-margin-bottom-0" data-module="govuk-details">
                                            <summary className="govuk-details__summary">
              <span className="govuk-details__summary-text">
                Data schema description
              </span>
                                            </summary>
                                            <div className="govuk-details__text">
                                                <p><strong>Provider identifier:</strong> {d.providerIdentifier}</p>
                                                <p><strong>Description:</strong> {d.description}</p>
                                            </div>
                                        </details>
                                    </div>
                                </th>
                                <td className="govuk-table__cell"><DateFormatter date={d.lastUpdatedDate} utc={false}/></td>
                                <td className="govuk-table__cell">
                                    <div className="attachment__thumbnail">
                                        <a className="govuk-link" target="_self" tabIndex={-1} aria-hidden="true" href={`/api/datasets/download-dataset-schema/${d.id}`}>
                                            <svg className="attachment__thumbnail-image thumbnail-image-small " version="1.1" viewBox="0 0 99 140" width="99" height="140" aria-hidden="true">
                                                <path d="M12 12h75v27H12zm0 47h18.75v63H12zm55 2v59H51V61h16m2-2H49v63h20V59z" stroke-width="0"></path>
                                                <path d="M49 61.05V120H32.8V61.05H49m2-2H30.75v63H51V59zm34 2V120H69.05V61.05H85m2-2H67v63h20V59z" stroke-width="0"></path>
                                                <path d="M30 68.5h56.5M30 77.34h56.5M30 112.7h56.5M30 95.02h56.5M30 86.18h56.5M30 103.86h56.5" fill="none" stroke-miterlimit="10" stroke-width="2"></path>
                                            </svg>
                                        </a>
                                    </div>
                                    <div className="attachment__details">
                                        <p className="govuk-body-s">
                                            <a className="govuk-link" target="_self" href={`/api/datasets/download-dataset-schema/${d.id}`}>{d.name}.xlsx</a></p>
                                    </div>
                                </td>
                                <td className="govuk-table__cell"></td>
                            </tr>)}
                        </tbody>
                    </table>
                    <BackToTop id={"top"} />
                    <nav role="navigation" aria-label="Pagination">
                        <div className="pagination__summary">Showing {datasetDefinitions.startItemNumber} - {datasetDefinitions.endItemNumber} of {datasetDefinitions.totalResults} results</div>
                        <Pagination currentPage={datasetDefinitions.currentPage} lastPage={datasetDefinitions.pagerState.lastPage} callback={setPagination}/>
                    </nav>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
}