import * as React from "react";
import {LoadingStatus} from "../LoadingStatus";
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {getDatasetBySpecificationIdService, toggleDatasetRelaionshipService} from "../../services/datasetService";
import {DatasetSummary} from "../../types/DatasetSummary";
import {ToggleDatasetSchemaRequest} from "../../types/Datasets/ToggleDatasetSchemaRequest";
import {useErrors} from "../../hooks/useErrors";
import { MultipleErrorSummary } from "../MultipleErrorSummary";
import {DateTimeFormatter} from "../DateTimeFormatter";

export function Datasets(props: { specificationId: string, lastConverterWizardReportDate: Date | undefined }) {
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

    const {errors, addError} = useErrors();

    const handleToggleConverter = async (e: React.ChangeEvent<HTMLInputElement>, relationshipId:string) => {
        const request: ToggleDatasetSchemaRequest = {
            relationshipId: relationshipId,
            converterEnabled: e.target.value === "true"
        };
        const response = await toggleDatasetRelaionshipService(request);
        if (response.status !== 200) {
            addError({error: `${response.statusText} ${response.data}`, description: "Error whilst setting enable copy data for provider", fieldName: "converter-enabled"});
        }
    };

    return <section className="govuk-tabs__panel" id="datasets">
        <LoadingStatus title={"Loading datasets"}
                       hidden={!isLoadingDatasets}
                       description={"Please wait whilst datasets are loading"}/>
        <MultipleErrorSummary errors={errors}/>
        <div className="govuk-grid-row" hidden={isLoadingDatasets}>
            <div className="govuk-grid-column-two-thirds">
                <h2 className="govuk-heading-l">Datasets</h2>
            </div>
            <div className="govuk-grid-column-one-third">
                <div>
                    <Link role="link"
                          to={`/Datasets/DataRelationships/${props.specificationId}`}
                          id="dataset-specification-relationship-button"
                          className="govuk-link" data-module="govuk-button">Map data source file to data set</Link>
                </div>
                <div>
                    <Link role={"link"} className="govuk-link"
                          to={`/Datasets/CreateDataset/${props.specificationId}`}>
                        Create dataset
                    </Link>
                </div>
                {props.lastConverterWizardReportDate &&
                <div>
                    <a className="govuk-link"
                       href={`/api/datasets/reports/${props.specificationId}/download`}>
                        Converter wizard report
                    </a>
                    <br/>
                    <p className="govuk-body-s">
                        Converter wizard last run: <DateTimeFormatter date={props.lastConverterWizardReportDate}/>
                    </p>
                </div>
                }
            </div>
        </div>
        <table className="govuk-table" hidden={isLoadingDatasets}>
            <caption className="govuk-table__caption">Dataset and schemas</caption>
            <thead className="govuk-table__head">
            <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">Dataset</th>
                <th scope="col" className="govuk-table__header">Data schema</th>
                <th scope="col" className="govuk-table__header">Enable copy data for provider</th>
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
                    <td className="govuk-table__cell">
                        {ds.converterEligible &&
                        <div className="govuk-form-group" data-testid={`converter-enabled-${ds.id}`}>
                            <div className="govuk-radios govuk-radios--inline">
                                <div className="govuk-radios__item">
                                    <input className="govuk-radios__input"
                                        id={`converter-enabled-${ds.id}.yes`}
                                        name={`converter-enabled-${ds.id}`}
                                        type="radio" value="true" defaultChecked={ds.converterEnabled}
                                        onChange={(e) => handleToggleConverter(e, ds.id)}/>
                                    <label className="govuk-label govuk-radios__label"
                                        htmlFor={`converter-enabled-${ds.id}.yes`}>
                                        Yes
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input className="govuk-radios__input"
                                        id={`converter-enabled-${ds.id}.no`}
                                        name={`converter-enabled-${ds.id}`}
                                        type="radio" value="false" defaultChecked={!ds.converterEnabled}
                                        onChange={(e) => handleToggleConverter(e, ds.id)}/>
                                    <label className="govuk-label govuk-radios__label"
                                        htmlFor={`converter-enabled-${ds.id}.no`}>
                                        No
                                    </label>
                                </div>
                            </div>
                        </div>}
                    </td>
                </tr>
            )}
            </tbody>
        </table>
    </section>
}