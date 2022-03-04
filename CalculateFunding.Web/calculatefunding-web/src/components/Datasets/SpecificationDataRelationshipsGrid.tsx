import React, { useMemo } from "react";

import { convertToSlug } from "../../helpers/stringHelper";
import { DatasetRelationshipType } from "../../types/Datasets/DatasetRelationshipType";
import { SpecificationDatasetRelationshipsViewModelItem } from "../../types/Datasets/SpecificationDatasetRelationshipsViewModel";
import { JobNotification } from "../../types/Jobs/JobSubscriptionModels";
import { DateTimeFormatter } from "../DateTimeFormatter";
import { LoadingFieldStatus } from "../LoadingFieldStatus";
import { LoadingStatus } from "../LoadingStatus";
import { NoData } from "../NoData";
import { TextLink } from "../TextLink";

export interface SpecificationDataRelationshipsGridProps {
  isLoadingDatasetRelationships: boolean;
  datasetRelationships: SpecificationDatasetRelationshipsViewModelItem[];
  converterWizardJobs: JobNotification[];
}

interface DataRelationshipItemRowProps {
  item: SpecificationDatasetRelationshipsViewModelItem;
  converterWizardJobs: JobNotification[];
}

interface DataSetDetailsProps {
  item: SpecificationDatasetRelationshipsViewModelItem;
}

const SpecificationDataRelationshipsGrid = React.memo(
  ({
    isLoadingDatasetRelationships,
    datasetRelationships,
    converterWizardJobs,
  }: SpecificationDataRelationshipsGridProps) => {
    if (isLoadingDatasetRelationships) {
      return <LoadingStatus title={"Loading data sets"} />;
    }

    if (!datasetRelationships?.length) {
      return <NoData excludeSearchTips={true} />;
    }

    return (
      <table id="datarelationship-table" data-testid={"datarelationship-table"} className="govuk-table">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header govuk-!-width-one-half">
              Data set
            </th>
            <th scope="col" className="govuk-table__header">
              Data set type
            </th>
            <th scope="col" className="govuk-table__header">
              Mapped data source
            </th>
            <th scope="col" className="govuk-table__header"></th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {datasetRelationships.map((item, index) => (
            <DataRelationshipItemRow key={index} item={item} converterWizardJobs={converterWizardJobs} />
          ))}
        </tbody>
      </table>
    );
  }
);

const DataSetDetails = ({ item }: DataSetDetailsProps) => {
  return (
    <details
      className="govuk-details govuk-!-margin-bottom-0 govuk-!-margin-top-2"
      data-module="govuk-details"
    >
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">Data set details</span>
      </summary>
      {item.relationshipType === DatasetRelationshipType.Uploaded ? (
        <div className="govuk-details__text">
          <p className="govuk-body">
            <strong>Data schema:</strong> {item.definitionName}
          </p>
          <p className="govuk-body">
            <strong>Description:</strong> {item.definitionDescription}
          </p>
          <p className="govuk-body">
            <strong>Last mapped:</strong> <DateTimeFormatter date={item.lastUpdatedDate} />
          </p>
          <p className="govuk-body">
            <strong>Last mapped by:</strong> {item.lastUpdatedAuthorName}
          </p>
        </div>
      ) : (
        <div className="govuk-details__text">
          <p className="govuk-body">
            <strong>Referenced specification:</strong> {item.referencedSpecificationName}
          </p>
          <p className="govuk-body">
            <strong>Description:</strong> {item.relationshipDescription}
          </p>
          <p className="govuk-body">
            <strong>Last mapped:</strong> <DateTimeFormatter date={item.lastUpdatedDate} />
          </p>
          <p className="govuk-body">
            <strong>Last mapped by:</strong> {item.lastUpdatedAuthorName}
          </p>
        </div>
      )}
    </details>
  );
};

const DataRelationshipItemRow = React.memo(({ item, converterWizardJobs }: DataRelationshipItemRowProps) => {
  const hasConverterWizardRunning = useMemo(
    () =>
      converterWizardJobs.some(
        (n) => n.latestJob?.triggeredByEntityId === item.relationshipId && n.latestJob?.isActive
      ),
    [item.relationshipId, converterWizardJobs]
  );

  return (
    <tr className="govuk-table__row" data-testid={`tr-relationship-${convertToSlug(item.relationshipId)}`}>
      <th scope="row" className="govuk-table__header">
        {item.relationName}
        {item.isProviderData ? (
          <span className="govuk-body-s govuk-!-margin-left-1">(Provider data)</span>
        ) : (
          ""
        )}
        <DataSetDetails item={item} />
      </th>
      <td className="govuk-table__cell">
        {item.relationshipType === DatasetRelationshipType.ReleasedData ? "Released data" : "Uploaded data"}
      </td>
      <td className="govuk-table__cell">
        {hasConverterWizardRunning ? (
          <LoadingFieldStatus title={"Converter wizard running. Please wait."} />
        ) : !item.hasDataSourceFileToMap ? (
          "No data source files uploaded to map to"
        ) : item.datasetName && item.datasetName.length > 0 ? (
          `${item.datasetName} (version ${item.datasetVersion})`
        ) : (
          "No data source file mapped"
        )}
      </td>
      <td className="govuk-table__cell">
        {item.hasDataSourceFileToMap && !hasConverterWizardRunning && (
          <TextLink to={`/Datasets/SelectDataSource/${item.relationshipId}`}>
            {item.datasetName && item.datasetName.length > 0 ? "Change" : "Map"}
          </TextLink>
        )}
      </td>
    </tr>
  );
});

export default SpecificationDataRelationshipsGrid;
