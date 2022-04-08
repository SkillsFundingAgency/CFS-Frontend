import { AxiosError } from "axios";
import * as React from "react";
import { ChangeEvent } from "react";
import { useMutation } from "react-query";
import { Link } from "react-router-dom";

import { useSpecificationDatasets } from "../../hooks/DataSets/useSpecificationDatasets";
import { useErrors } from "../../hooks/useErrors";
import { useFeatureFlags } from "../../hooks/useFeatureFlags";
import * as datasetService from "../../services/datasetService";
import { DatasetRelationshipType } from "../../types/Datasets/DatasetRelationshipType";
import { ToggleDatasetSchemaRequest } from "../../types/Datasets/ToggleDatasetSchemaRequest";
import { DateTimeFormatter } from "../DateTimeFormatter";
import { LoadingStatus } from "../LoadingStatus";
import { MultipleErrorSummary } from "../MultipleErrorSummary";
import { TextLink } from "../TextLink";

export function Datasets({
  specificationId,
  lastConverterWizardReportDate,
}: {
  specificationId: string;
  lastConverterWizardReportDate: Date | undefined;
}) {
  const featureFlags = useFeatureFlags();

  const { datasets, isLoadingDatasets, refetchDatasets } = useSpecificationDatasets({
    specificationId,
    options: {
      onError: (err) =>
        addError({
          error: err,
          description: "Could not load data sets",
          suggestion: "Please try again later",
        }),
    },
  });

  const { mutate: handleToggleConverter } = useMutation<boolean, AxiosError, ToggleDatasetSchemaRequest>(
    async (request) => (await datasetService.toggleDatasetRelationshipService(request)).data,
    {
      onError: (err) =>
        addError({
          error: err,
          description: "Error whilst setting enable copy data for provider",
        }),
      onSuccess: () => refetchDatasets(),
    }
  );

  const { errors, addError } = useErrors();

  return (
    <section className="govuk-tabs__panel" id="datasets">
      <LoadingStatus
        title={"Loading data sets"}
        hidden={!isLoadingDatasets}
        description={"Please wait whilst data sets are loading"}
      />
      <MultipleErrorSummary errors={errors} />
      <div className="govuk-grid-row" hidden={isLoadingDatasets}>
        <div className="govuk-grid-column-two-thirds">
          <h2 className="govuk-heading-l">Datasets</h2>
        </div>
        <div className="govuk-grid-column-one-third">
          <div>
            <Link
              role="link"
              to={`/Datasets/DataRelationships/${specificationId}`}
              id="dataset-specification-relationship-button"
              className="govuk-link govuk-link--no-visited-state"
              data-module="govuk-button"
            >
              Map data source file to data set
            </Link>
          </div>
          <div>
            <TextLink
              to={
                featureFlags.specToSpec
                  ? `/Datasets/Create/SelectDatasetTypeToCreate/${specificationId}`
                  : `/Datasets/CreateDataset/${specificationId}`
              }
            >
              Create dataset
            </TextLink>
          </div>
          {lastConverterWizardReportDate && (
            <div>
              <a
                className="govuk-link govuk-link--no-visited-state"
                href={`/api/datasets/reports/${specificationId}/download`}
              >
                Converter wizard report
              </a>
              <br />
              <p className="govuk-body-s">
                Converter wizard last run: <DateTimeFormatter date={lastConverterWizardReportDate} />
              </p>
            </div>
          )}
        </div>
      </div>
      <table className="govuk-table" hidden={isLoadingDatasets}>
        <caption className="govuk-table__caption">Dataset and schemas</caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">
              Dataset
            </th>
            <th scope="col" className="govuk-table__header">
              Data set type
            </th>
            <th scope="col" className="govuk-table__header">
              Data schema
            </th>
            <th scope="col" className="govuk-table__header">
              Enable copy data for provider
            </th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {datasets?.map((ds) => {
            const onToggleConverter = (e: ChangeEvent<HTMLInputElement>) => {
              const request: ToggleDatasetSchemaRequest = {
                relationshipId: ds.id,
                converterEnabled: e.target.value === "true",
              };
              handleToggleConverter(request);
            };
            return (
              <tr className="govuk-table__row" key={ds.id}>
                <td scope="row" className="govuk-table__cell">
                  {ds.relationshipType === DatasetRelationshipType.Uploaded ? (
                    ds.name
                  ) : (
                    <TextLink to={`/Datasets/${ds.id}/Edit/${specificationId}`}>{ds.name}</TextLink>
                  )}
                  <div className="govuk-!-margin-top-2">
                    <details className="govuk-details govuk-!-margin-bottom-0" data-module="govuk-details">
                      <summary className="govuk-details__summary">
                        <span className="govuk-details__summary-text">Data set Description</span>
                      </summary>
                      <div className="govuk-details__text">{ds.relationshipDescription}</div>
                    </details>
                  </div>
                </td>
                <td className="govuk-table__cell">
                  {ds.relationshipType === DatasetRelationshipType.ReleasedData
                    ? "Released data"
                    : "Uploaded data"}
                </td>
                <td className="govuk-table__cell">{ds.definition?.name || ds.name}</td>
                <td className="govuk-table__cell">
                  {ds.converterEligible && (
                    <div className="govuk-form-group" data-testid={`converter-enabled-${ds.id}`}>
                      <div className="govuk-radios govuk-radios--inline">
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id={`converter-enabled-${ds.id}.yes`}
                            name={`converter-enabled-${ds.id}`}
                            type="radio"
                            value="true"
                            defaultChecked={ds.converterEnabled}
                            onChange={onToggleConverter}
                          />
                          <label
                            className="govuk-label govuk-radios__label"
                            htmlFor={`converter-enabled-${ds.id}.yes`}
                          >
                            Yes
                          </label>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id={`converter-enabled-${ds.id}.no`}
                            name={`converter-enabled-${ds.id}`}
                            type="radio"
                            value="false"
                            defaultChecked={!ds.converterEnabled}
                            onChange={onToggleConverter}
                          />
                          <label
                            className="govuk-label govuk-radios__label"
                            htmlFor={`converter-enabled-${ds.id}.no`}
                          >
                            No
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
