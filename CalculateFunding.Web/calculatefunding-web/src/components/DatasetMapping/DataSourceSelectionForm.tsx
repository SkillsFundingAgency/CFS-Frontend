import {
  DatasetWithVersions,
  DataSourceRelationshipResponseViewModel,
} from "../../types/Datasets/DataSourceRelationshipResponseViewModel";
import { DataSourceSelection } from "../../types/Datasets/DataSourceSelection";
import { DatasetVersionSearchResponse } from "../../types/Datasets/DatasetVersionSearchResponse";
import Form from "../Form";
import { DataSetVersionSelector } from "./DatasetVersionSelector";
import { DatasetVersionSummary } from "../../types/Datasets/DatasetVersionSummary";
import React from "react";
import { NoData } from "../NoData";

export interface DataSourceSelectionFormProps {
  isLoading: boolean;
  isBusy: boolean;
  isSearchingForDataSetVersions: boolean;
  hasMissingPermissions: boolean;
  isViewingAllVersions: boolean;
  relationshipData: DataSourceRelationshipResponseViewModel | undefined;
  originalSelection: DataSourceSelection;
  selection: DataSourceSelection;
  datasetVersionSearchResponse: DatasetVersionSearchResponse | undefined;
  onVersionChanged: (dataSetId: string, newVersion: number) => void;
  expandToViewAllVersions: (dataSetId: string) => void;
  contractToViewAllDataSets: () => void;
  onSave: () => void;
  onCancel: () => void;
  setVersionsPage: (newPage: number) => void;
  onChangeDataset: (datasetId: string) => void;
}

export const DataSourceSelectionForm: React.FunctionComponent<DataSourceSelectionFormProps> = ({
  hasMissingPermissions,
  isLoading,
  isBusy,
  isSearchingForDataSetVersions,
  isViewingAllVersions,
  relationshipData,
  originalSelection,
  selection,
  datasetVersionSearchResponse,
  onVersionChanged,
  expandToViewAllVersions,
  contractToViewAllDataSets,
  setVersionsPage,
  onChangeDataset,
  onSave,
  onCancel,
}) => {
  const hasNoData = !relationshipData?.datasets?.length;
  const showSingleDataSet = relationshipData?.datasets?.length === 1;
  const formHeading =
    isBusy || isLoading || isViewingAllVersions || hasMissingPermissions || hasNoData
      ? ""
      : showSingleDataSet
      ? (selection.dataset?.name as string)
      : "Select data source file";
  const formCaption =
    isBusy || isLoading || isViewingAllVersions || hasMissingPermissions || hasNoData
      ? ""
      : showSingleDataSet
      ? (selection.dataset?.description as string)
      : "Select one option.";

  return (
    <Form token="select-data-source" inline={true} heading={formHeading} titleCaption={formCaption}>
      {relationshipData && hasNoData && <NoData excludeSearchTips={true} />}
      {!isLoading && !hasMissingPermissions && !isBusy && !hasNoData && (
        <>
          {(showSingleDataSet || isViewingAllVersions) && selection.dataset ? (
            <DataSetVersionSelector
              dataset={selection.dataset}
              versionCount={selection.dataset.versions.length}
              versionSearchResult={datasetVersionSearchResponse}
              isSearchingForDataSetVersions={isSearchingForDataSetVersions}
              isViewingAllVersions={isViewingAllVersions}
              onVersionSelected={onVersionChanged}
              onExpand={expandToViewAllVersions}
              setPage={setVersionsPage}
              selection={selection}
            />
          ) : (
            <DataSetSelector
              datasets={relationshipData.datasets}
              selection={selection}
              showSingleDataSet={showSingleDataSet}
              isSearchingForDataSetVersions={isSearchingForDataSetVersions}
              onChangeDataset={onChangeDataset}
              onExpandToViewAllVersions={expandToViewAllVersions}
              onContractToViewAllDataSets={contractToViewAllDataSets}
              onChangeVersion={onVersionChanged}
            />
          )}
        </>
      )}
      <Actions
        hasPermissionToSave={!hasMissingPermissions && !!relationshipData}
        hasNoData={hasNoData}
        isLoading={isLoading}
        hasSelected={
          !!selection.dataset &&
          !!selection.version &&
          (originalSelection.dataset !== selection.dataset || originalSelection.version !== selection.version)
        }
        isBusy={isBusy}
        onSave={onSave}
        onCancel={onCancel}
      />
    </Form>
  );
};

const DataSetSelector = (props: {
  datasets: DatasetWithVersions[];
  showSingleDataSet: boolean;
  isSearchingForDataSetVersions: boolean;
  selection: DataSourceSelection;
  onExpandToViewAllVersions: (dataSetId: string) => void;
  onContractToViewAllDataSets: () => void;
  onChangeDataset: (datasetId: string) => void;
  onChangeVersion: (datasetId: string, newVersion: number) => void;
}) => {
  const compareDates = (a: Date, b: Date): number => {
    return new Date(b).getTime() - new Date(a).getTime();
  };

  const getLatestDatasetVersionDate = (versions: DatasetVersionSummary[]): Date => {
    return versions && new Date(versions.sort((a, b) => compareDates(a.date, b.date))[0].date);
  };

  function compareDatasetRelationshipByLastUpdate(
    dataset1: DatasetWithVersions,
    dataset2: DatasetWithVersions
  ): number {
    return compareDates(
      getLatestDatasetVersionDate(dataset2.versions),
      getLatestDatasetVersionDate(dataset1.versions)
    );
  }

  return (
    <div
      className={`govuk-radios ${props.showSingleDataSet ? "" : "govuk-radios--conditional"}`}
      data-module="govuk-radios"
      data-testid="data-set-selector"
    >
      {props.datasets.sort(compareDatasetRelationshipByLastUpdate).map((dataset) => {
        const isSelected = props.selection.dataset
          ? dataset.id === props.selection.dataset?.id
          : !!dataset.selectedVersion;
        return (
          <React.Fragment key={dataset.id}>
            <DataSetDetails dataset={dataset} isSelected={isSelected} onSelected={props.onChangeDataset} />
            {isSelected && (
              <DataSetVersionSelector
                selection={props.selection}
                dataset={dataset}
                versionCount={dataset.totalCount || 0}
                isViewingAllVersions={false}
                isSearchingForDataSetVersions={props.isSearchingForDataSetVersions}
                onVersionSelected={props.onChangeVersion}
                onExpand={props.onExpandToViewAllVersions}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const DataSetDetails = (props: {
  dataset: DatasetWithVersions;
  isSelected: boolean;
  onSelected: (datasetId: string) => void;
}) => {
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!props.isSelected) props.onSelected(e.target.value);
  }

  return (
    <div className="govuk-radios__item">
      <input
        className="govuk-radios__input"
        id={`dataset-${props.dataset.id}`}
        type="radio"
        aria-controls="conditional-master-dataset-option-conditional"
        aria-expanded="false"
        value={props.dataset.id}
        checked={props.isSelected}
        onChange={onChange}
      />
      <label
        className="govuk-label govuk-radios__label govuk-!-padding-top-0"
        htmlFor={`dataset-${props.dataset.id}`}
      >
        {props.dataset.name}
        <span className="govuk-hint">
          <strong>Description:</strong> {props.dataset.description}
        </span>
      </label>
    </div>
  );
};

const Actions = (props: {
  hasPermissionToSave: boolean;
  hasSelected: boolean;
  isLoading: boolean;
  isBusy: boolean;
  hasNoData: boolean;
  onSave: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="govuk-form-group">
      {props.hasPermissionToSave && !props.isLoading && !props.hasNoData && (
        <button
          className="govuk-button govuk-!-margin-right-1"
          name="saveButton"
          onClick={props.onSave}
          disabled={props.isBusy || !props.hasSelected}
        >
          Save
        </button>
      )}
      <button className="govuk-button govuk-button--secondary" name="backButton" onClick={props.onCancel}>
        {props.hasPermissionToSave && !props.hasNoData && !props.isBusy && !props.isLoading
          ? "Cancel"
          : "Back"}
      </button>
    </div>
  );
};
