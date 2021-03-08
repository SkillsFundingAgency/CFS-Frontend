import * as React from "react";
import {LoadingStatus} from "../LoadingStatus";
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {getDatasetBySpecificationIdService} from "../../services/datasetService";
import {DatasetSummary} from "../../types/DatasetSummary";

export function Datasets(props: { specificationId: string }) {
    const [datasets, setDatasets] = useState<DatasetSummary>({
        content: [],
        statusCode: 0
    });
    const [isLoadingDatasets, setIsLoadingDatasets] = useState(true);

    useEffect(() => {
        setIsLoadingDatasets(true)
        getDatasetBySpecificationIdService(props.specificationId)
            .then((result) => {
                const response = result;
                if (response.status === 200) {
                    setDatasets(response.data as DatasetSummary);
                }
            }).finally(() => {
            setIsLoadingDatasets(false);
        });
    }, [props.specificationId]);

    return <section className="govuk-tabs__panel" id="datasets">
        <LoadingStatus title={"Loading datasets"}
                       hidden={!isLoadingDatasets}
                       description={"Please wait whilst datasets are loading"}/>
        <div className="govuk-grid-row" hidden={isLoadingDatasets}>
            <div className="govuk-grid-column-two-thirds">
                <h2 className="govuk-heading-l">Datasets</h2>
            </div>
            <div className="govuk-grid-column-one-third">
                <div><Link role={"link"} to={`/Datasets/DataRelationships/${props.specificationId}`}
                           id={"dataset-specification-relationship-button"}
                           className="govuk-link" data-module="govuk-button">Map data source file to data set</Link>
                </div>
                <div>
                    <Link role={"link"} to={`/Datasets/CreateDataset/${props.specificationId}`} className="govuk-link">Create
                        dataset</Link>
                </div>
            </div>

        </div>
        <table className="govuk-table" hidden={isLoadingDatasets}>
            <caption className="govuk-table__caption">Dataset and schemas</caption>
            <thead className="govuk-table__head">
            <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header govuk-!-width-one-half">Dataset</th>
                <th scope="col" className="govuk-table__header govuk-!-width-one-half">Data schema</th>
            </tr>
            </thead>
            <tbody className="govuk-table__body">
            {datasets.content.map(ds =>
                <tr className="govuk-table__row" key={ds.id}>
                    <td scope="row" className="govuk-table__cell">{ds.name}
                        <div className="govuk-!-margin-top-2">
                            <details className="govuk-details govuk-!-margin-bottom-0"
                                     data-module="govuk-details">
                                <summary className="govuk-details__summary">
                                                                <span
                                                                    className="govuk-details__summary-text">Dataset Description</span>
                                </summary>
                                <div className="govuk-details__text">
                                    {ds.relationshipDescription}
                                </div>
                            </details>
                        </div>
                    </td>
                    <td className="govuk-table__cell">{ds.definition.name}</td>
                </tr>
            )}
            </tbody>
        </table>
    </section>
}