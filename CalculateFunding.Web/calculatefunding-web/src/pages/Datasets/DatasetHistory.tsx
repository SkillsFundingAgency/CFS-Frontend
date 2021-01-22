import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {useEffectOnce} from "../../hooks/useEffectOnce";
import {getDatasetHistoryService} from "../../services/datasetService";
import {RouteComponentProps} from "react-router";
import {DatasetVersionHistoryViewModel, Result} from "../../types/Datasets/DatasetVersionHistoryViewModel";
import {DateFormatter} from "../../components/DateFormatter";
import {Footer} from "../../components/Footer";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useErrors} from "../../hooks/useErrors";

export interface DatasetHistoryRouteProps {
    datasetId: string
}

export function DatasetHistory({match}: RouteComponentProps<DatasetHistoryRouteProps>) {
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
    const [datasetHistory, setDatasetHistory] = useState<DatasetVersionHistoryViewModel>({
        results: [],
        currentPage: 0,
        endItemNumber: 0,
        facets: [],
        pagerState: {
            currentPage: 0,
            pages: [],
            lastPage: 0,
            displayNumberOfPages: 0,
            nextPage: 0,
            previousPage: 0
        },
        pageSize: 0,
        startItemNumber: 0,
        totalErrorResults: 0,
        totalResults: 0
    });

    const {errors, addError} = useErrors();

    useEffectOnce(() => {
        getDatasetHistoryService(match.params.datasetId, 1, 50).then((result) => {
            const response = result.data as DatasetVersionHistoryViewModel
            setDatasetHistory(response);
            setDataset(response.results[0]);
        }).catch(err => {
            addError({error: err, description: `Error while getting dataset history`});
        });
    });

    return (<div>
        <Header location={Section.Datasets} />
        <div className="govuk-width-container">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <Breadcrumbs>
                        <Breadcrumb name={"Calculate funding"} url={"/"} />
                        <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"} />
                        <Breadcrumb name={"Manage data source files"} url={"/Datasets/ManageDataSourceFiles"} />
                        <Breadcrumb name={dataset.name} />
                    </Breadcrumbs>
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <MultipleErrorSummary errors={errors} />
                </div>
            </div>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <span className="govuk-caption-l">Data source</span>
                    <h1 className="govuk-heading-l">{dataset.name}</h1>
                    <span className="govuk-caption-m">Data schema</span>
                    <h2 className="govuk-heading-m">{dataset.definitionName}</h2>
                </div>
            </div>
            <div className="govuk-grid-row govuk-!-margin-bottom-5">
                <div className="govuk-grid-column-two-thirds">
                    <span className="govuk-caption-m">Description</span>
                    <h3 className="govuk-heading-m">{dataset.description}</h3>

                </div>
            </div>
            <table className="govuk-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header govuk-!-width-one-half">Data source</th>
                        <th scope="col" className="govuk-table__header">Last updated</th>
                        <th scope="col" className="govuk-table__header">Download</th>
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    {datasetHistory.results.map(dh =>
                        <tr className="govuk-table__row">
                            <th scope="row" className="govuk-table__header"><p>Version {dh.version}</p>

                                <div className="govuk-!-margin-top-2">

                                    <details className="govuk-details govuk-!-margin-bottom-0" data-module="govuk-details">
                                        <summary className="govuk-details__summary">
                                            <span className="govuk-details__summary-text">
                                                Version notes
                                              </span>
                                        </summary>
                                        <div className="govuk-details__text">
                                            <p><strong>Updated by:</strong> {dh.lastUpdatedByName}</p>
                                            <p><strong>Change notes:</strong> {dh.changeNote}</p>
                                        </div>
                                    </details>
                                </div>
                            </th>
                            <td className="govuk-table__cell"><DateFormatter utc={false} date={dh.lastUpdatedDate} /></td>
                            <td className="govuk-table__cell">
                                <div className="attachment__thumbnail">
                                    <a className="govuk-link" target="_self" tabIndex={-1} aria-hidden="true"
                                        href={`/api/datasets/download-dataset-file/${dh.datasetId}/${dh.version}`}>
                                        <svg className="attachment__thumbnail-image thumbnail-image-small " version="1.1" viewBox="0 0 99 140"
                                            width="99" height="140" aria-hidden="true">
                                            <path d="M12 12h75v27H12zm0 47h18.75v63H12zm55 2v59H51V61h16m2-2H49v63h20V59z" stroke-width="0"></path>
                                            <path d="M49 61.05V120H32.8V61.05H49m2-2H30.75v63H51V59zm34 2V120H69.05V61.05H85m2-2H67v63h20V59z"
                                                stroke-width="0"></path>
                                            <path d="M30 68.5h56.5M30 77.34h56.5M30 112.7h56.5M30 95.02h56.5M30 86.18h56.5M30 103.86h56.5" fill="none"
                                                stroke-width="2"></path>
                                        </svg>
                                    </a>
                                </div>
                                <div className="attachment__details">
                                    <p className="govuk-body-s">
                                        <a className="govuk-link" target="_self"
                                            href={`/api/datasets/download-dataset-file/${dh.datasetId}/${dh.version}`}>{dh.blobName}</a></p>
                                </div>
                            </td>
                            <td className="govuk-table__cell"></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        <Footer />
    </div>
    )
}