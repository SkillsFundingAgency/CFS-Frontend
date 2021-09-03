import React, {useEffect, useState} from "react";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {searchDatasetVersions} from "../../services/datasetService";
import {RouteComponentProps} from "react-router";
import {DatasetChangeType, DatasetVersionDetails, DatasetVersionSearchResponse} from "../../types/Datasets/DatasetVersionSearchResponse";
import {DateTimeFormatter} from "../../components/DateTimeFormatter";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useErrors} from "../../hooks/useErrors";
import Pagination from "../../components/Pagination";
import {Title} from "../../components/Title";
import {Main} from "../../components/Main";
import {convertCamelCaseToSpaceDelimited} from "../../helpers/stringHelper";

export interface DatasetHistoryRouteProps {
    datasetId: string
}

export function DatasetHistory({match}: RouteComponentProps<DatasetHistoryRouteProps>) {
    const [dataset, setDataset] = useState<DatasetVersionDetails>();
    const [datasetHistory, setDatasetHistory] = useState<DatasetVersionSearchResponse>();
    const [pageNumber, setPageNumber] = useState<number>(1);
    const {errors, addError} = useErrors();

    useEffect(() => {
        searchDatasetVersions(match.params.datasetId, pageNumber, 50)
            .then((response) => {
                const result = response.data as DatasetVersionSearchResponse;
                setDatasetHistory(result);
                setDataset(result.results[0]);
            })
            .catch(err => {
                addError({error: err, description: `Error while getting dataset history`});
            });
    }, [match.params.datasetId, pageNumber]);


    return (<Main location={Section.Datasets}>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"}/>
                        <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"}/>
                        <Breadcrumb name={"Manage data source files"} url={"/Datasets/ManageDataSourceFiles"}/>
                        {dataset && <Breadcrumb name={dataset.name}/>}
                    </Breadcrumbs>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <MultipleErrorSummary errors={errors}/>
                </div>
            </div>
            <Title title={dataset?.name ?? ""}
                   includeBackLink={false}
            />
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <dl className="govuk-summary-list govuk-summary-list--no-border">
                        <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">
                                Data schema
                            </dt>
                            <dd className="govuk-summary-list__value">
                                {dataset?.definitionName}
                            </dd>
                        </div>
                        <div className="govuk-summary-list__row">
                            <dt className="govuk-summary-list__key">
                                Description
                            </dt>
                            <dd className="govuk-summary-list__value">
                                {dataset?.description}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
            <div className="govuk-grid-row govuk-!-padding-left-3">
                <table className="govuk-table" aria-label="Dataset Versions">
                    <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header govuk-!-width-one-third">Data source file versions</th>
                        <th scope="col" className="govuk-table__header">Update type</th>
                        <th scope="col" className="govuk-table__header">Last updated</th>
                        <th scope="col" className="govuk-table__header">Download</th>
                    </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                    {datasetHistory?.results?.map(version =>
                        <tr className="govuk-table__row" key={version.version}>
                            <th scope="row" className="govuk-table__header">
                                <p>Version {version.version}</p>
                                <div className="govuk-!-margin-top-2">
                                    <details className="govuk-details govuk-!-margin-bottom-0" data-module="govuk-details">
                                        <summary className="govuk-details__summary">
                                          <span className="govuk-details__summary-text">
                                            Change note
                                          </span>
                                        </summary>
                                        <div className="govuk-details__text">
                                            <p className="govuk-body">{version.changeNote}</p>
                                        </div>
                                    </details>
                                </div>
                            </th>
                            <td className="govuk-table__cell">
                                {convertCamelCaseToSpaceDelimited(version.changeType ? version.changeType : DatasetChangeType.NewVersion)}
                            </td>
                            <td className="govuk-table__cell">
                                <DateTimeFormatter date={version.lastUpdatedDate}/>
                                <p>Updated by: {version.lastUpdatedByName}</p>
                            </td>
                            <td className="govuk-table__cell">
                                <p className="govuk-body govuk-!-margin-bottom-0">Updated data source</p>
                                <a className="govuk-link" target="self" tabIndex={-1}
                                   href={`/api/datasets/download-dataset-file/${version.datasetId}/${version.version}`}>
                                    {version.blobName && version.blobName.substring(version.blobName.lastIndexOf("/") + 1)}
                                </a>
                                {version.changeType === DatasetChangeType.Merge &&
                                <>
                                    <p className="govuk-body govuk-!-margin-bottom-0 govuk-!-margin-top-4">Merge file</p>
                                    <a className="govuk-link" target="self" tabIndex={-1}
                                       href={`/api/datasets/download-merge-file/${version.datasetId}/${version.version}`}>download</a>
                                </>
                                }
                                <p></p>
                            </td>
                            <td className="govuk-table__cell"></td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            <section className="govuk-grid-row">
                {datasetHistory?.pagerState && datasetHistory.totalResults > 0 && datasetHistory.startItemNumber > 0 &&
                <nav className="govuk-!-margin-top-9" role="navigation" aria-label="Pagination">
                    <div className="pagination__summary">
                        <p className="govuk-body right-align">
                            {`Showing ${datasetHistory.startItemNumber} - ${datasetHistory.endItemNumber} of 
                        ${datasetHistory.totalResults} results`}
                        </p>
                    </div>
                    <Pagination currentPage={datasetHistory.currentPage}
                                lastPage={datasetHistory.pagerState.lastPage}
                                callback={setPageNumber}/>
                </nav>}
            </section>
        </Main>
    )
}
