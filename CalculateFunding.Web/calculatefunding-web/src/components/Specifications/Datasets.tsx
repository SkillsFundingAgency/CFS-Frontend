import * as React from "react";
import {LoadingStatus} from "../LoadingStatus";
import {Link} from "react-router-dom";
import {ToggleDatasetSchemaRequest} from "../../types/Datasets/ToggleDatasetSchemaRequest";
import {useErrors} from "../../hooks/useErrors";
import {MultipleErrorSummary} from "../MultipleErrorSummary";
import {DateTimeFormatter} from "../DateTimeFormatter";
import {FeatureFlagsState} from "../../states/FeatureFlagsState";
import {useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {useMutation, useQuery} from "react-query";
import {AxiosError} from "axios";
import * as datasetService from "../../services/datasetService";
import {DatasetRelationshipType} from "../../types/Datasets/DatasetRelationshipType";
import {ChangeEvent} from "react";
import {DatasetRelationship} from "../../types/DatasetRelationship";

export function Datasets(props: { specificationId: string, lastConverterWizardReportDate: Date | undefined }) {
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(state => state.featureFlags);

    const {data: datasets, isLoading: isLoadingDatasets} =
        useQuery<DatasetRelationship[], AxiosError>(
            `spec-datasets-${props.specificationId}`,
            async () => (await datasetService.getDatasetsBySpecification(props.specificationId)).data,
            {
                enabled: !!props.specificationId,
                onError: err => addError({
                    error: err,
                    description: "Could not load data sets",
                    suggestion: "Please try again later"
                })
            });

    const {mutate: handleToggleConverter, isLoading: isTogglingConverter} =
        useMutation<boolean, AxiosError, ToggleDatasetSchemaRequest>(
            async (request) =>
                (await datasetService.toggleDatasetRelationshipService(request)).data,
            {
                onError: err => addError({
                    error: err,
                    description: "Error whilst setting enable copy data for provider"
                })
            });

    const {errors, addError} = useErrors();

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
                          className="govuk-link govuk-link--no-visited-state" data-module="govuk-button">
                        Map data source file to data set
                    </Link>
                </div>
                <div>
                    <Link className="govuk-link govuk-link--no-visited-state"
                          to={featureFlagsState.specToSpec ? `/Datasets/Create/SelectDatasetTypeToCreate/${props.specificationId}` :
                              `/Datasets/CreateDataset/${props.specificationId}`}>
                        Create dataset
                    </Link>
                </div>
                {props.lastConverterWizardReportDate &&
                <div>
                    <a className="govuk-link govuk-link--no-visited-state"
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
                <th scope="col" className="govuk-table__header">Data set type</th>
                <th scope="col" className="govuk-table__header">Data schema</th>
                <th scope="col" className="govuk-table__header">Enable copy data for provider</th>
            </tr>
            </thead>
            <tbody className="govuk-table__body">
            {datasets?.map(ds => {
                const onToggleConverter = (e: ChangeEvent<HTMLInputElement>) => {
                    const request: ToggleDatasetSchemaRequest = {
                        relationshipId: ds.id,
                        converterEnabled: e.target.value === "true"
                    };
                    handleToggleConverter(request);
                }
                return (<tr className="govuk-table__row" key={ds.id}>
                        <td scope="row" className="govuk-table__cell">
                            {ds.relationshipType === DatasetRelationshipType.Uploaded ?
                                ds.name :
                                <Link className='govuk-link govuk-link--no-visited-state'
                                      to={`/Datasets/${ds.id}/Edit/${props.specificationId}`}>
                                    {ds.name}
                                </Link>
                            }
                            <div className="govuk-!-margin-top-2">
                                <details className="govuk-details govuk-!-margin-bottom-0"
                                         data-module="govuk-details">
                                    <summary className="govuk-details__summary">
                                    <span
                                        className="govuk-details__summary-text">
                                        Dataset Description
                                    </span>
                                    </summary>
                                    <div className="govuk-details__text">
                                        {ds.relationshipDescription}
                                    </div>
                                </details>
                            </div>
                        </td>
                        <td className="govuk-table__cell">
                            {ds.relationshipType === DatasetRelationshipType.ReleasedData ? 'Released data' : 'Uploaded data'}
                        </td>
                        <td className="govuk-table__cell">
                            {ds.definition?.name || ds.name}
                        </td>
                        <td className="govuk-table__cell">
                            {ds.converterEligible &&
                            <div className="govuk-form-group" data-testid={`converter-enabled-${ds.id}`}>
                                <div className="govuk-radios govuk-radios--inline">
                                    <div className="govuk-radios__item">
                                        <input className="govuk-radios__input"
                                               id={`converter-enabled-${ds.id}.yes`}
                                               name={`converter-enabled-${ds.id}`}
                                               type="radio"
                                               value="true"
                                               defaultChecked={ds.converterEnabled}
                                               onChange={onToggleConverter}/>
                                        <label className="govuk-label govuk-radios__label"
                                               htmlFor={`converter-enabled-${ds.id}.yes`}>
                                            Yes
                                        </label>
                                    </div>
                                    <div className="govuk-radios__item">
                                        <input className="govuk-radios__input"
                                               id={`converter-enabled-${ds.id}.no`}
                                               name={`converter-enabled-${ds.id}`}
                                               type="radio"
                                               value="false"
                                               defaultChecked={!ds.converterEnabled}
                                               onChange={onToggleConverter}/>
                                        <label className="govuk-label govuk-radios__label"
                                               htmlFor={`converter-enabled-${ds.id}.no`}>
                                            No
                                        </label>
                                    </div>
                                </div>
                            </div>}
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    </section>
}