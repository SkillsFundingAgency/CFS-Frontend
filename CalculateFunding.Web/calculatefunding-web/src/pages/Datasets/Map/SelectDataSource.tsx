import React, { useEffect, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import { DataSourceSelectionForm } from "../../../components/DatasetMapping/DataSourceSelectionForm";
import JobBanner from "../../../components/Jobs/JobBanner";
import { LoadingStatusNotifier } from "../../../components/LoadingStatusNotifier";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../../components/PermissionStatus";
import { Title } from "../../../components/Title";
import { WarningText } from "../../../components/WarningText";
import { useDataSetVersionSearch } from "../../../hooks/DataSets/useDataSetVersionSearch";
import { AddJobSubscription, useJobSubscription } from "../../../hooks/Jobs/useJobSubscription";
import { useSpecificationPermissions } from "../../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../../hooks/useErrors";
import { useRelationshipData } from "../../../hooks/useRelationshipData";
import { useSpecificationSummary } from "../../../hooks/useSpecificationSummary";
import * as datasetService from "../../../services/datasetService";
import { DataSourceSelection } from "../../../types/Datasets/DataSourceSelection";
import { JobNotification, MonitorFallback, MonitorMode } from "../../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../../types/jobType";
import { Permission } from "../../../types/Permission";
import { Section } from "../../../types/Sections";

export interface SelectDataSourceRouteProps {
  datasetRelationshipId: string;
}

export const SelectDataSource: React.FunctionComponent<RouteComponentProps<SelectDataSourceRouteProps>> = ({
  match,
}: RouteComponentProps<SelectDataSourceRouteProps>) => {
  const datasetRelationshipId = match.params.datasetRelationshipId;
  const [selection, setSelection] = useState<DataSourceSelection>({
    dataset: undefined,
    version: undefined,
  });
  const [originalSelection, setOriginalSelection] = useState<DataSourceSelection>({
    dataset: undefined,
    version: undefined,
  });
  const [versionsPage, setVersionsPage] = useState<number>(1);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isViewingAllVersions, setIsViewingAllVersions] = useState<boolean>(false);
  const { errors, validate, clearErrorMessages, addError } = useErrors();
  const history = useHistory();
  const {
    addSub,
    removeAllSubs,
    subs,
    results: jobNotifications,
  } = useJobSubscription({
    onError: (err) =>
      addError({
        error: err,
        description: "An error occurred while monitoring the running jobs",
      }),
  });
  const { relationshipData, isLoadingRelationshipData } = useRelationshipData(datasetRelationshipId);
  const specificationId =
    relationshipData && relationshipData.specificationId ? relationshipData.specificationId : "";
  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({
      error: err,
      description: "Error while loading specification",
    })
  );
  const { isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions } =
    useSpecificationPermissions(specificationId, [Permission.CanMapDatasets]);

  const { datasetVersionSearchResponse, isSearchingForDataSetVersions } = useDataSetVersionSearch({
    relationshipId: datasetRelationshipId,
    dataSetId: selection.dataset?.id,
    pageNumber: versionsPage,
    pageSize: 50,
    enabled: isViewingAllVersions,
    onError: (err) =>
      addError({
        error: err,
        description: "Could not load data versions",
        suggestion: "Please try again later",
      }),
  });

  useEffect(() => {
    if (!specificationId || !relationshipData?.relationshipId) return;

    const preSelected =
      relationshipData.datasets.find((x) => !!x.selectedVersion) ||
      (relationshipData.datasets.length === 1 ? relationshipData.datasets[0] : undefined);

    if (preSelected) {
      setSelection({
        dataset: preSelected,
        version:
          preSelected.versions.length === 1 ? preSelected.versions[0].version : preSelected.selectedVersion,
      });

      if (preSelected.selectedVersion) {
        setOriginalSelection({
          dataset: preSelected,
          version: preSelected.selectedVersion,
        });
      }
    }

    if (!relationshipData.datasets.length) {
      addError({
        error: "No datasets available for you",
        suggestion: "Please check your permissions or data.",
      });
    }
    const entityId = relationshipData.relationshipId;
    if (!subs || !subs.some((s) => s.filterBy.triggerByEntityId === entityId)) {
      addSub({
        fetchPriorNotifications: true,
        filterBy: {
          specificationId: specificationId,
          triggerByEntityId: entityId,
        },
        monitorMode: MonitorMode.SignalR,
        monitorFallback: MonitorFallback.Polling,
        onError: (err) =>
          addError({
            error: err,
            description:
              "There has been data schema change since the last version of this data source file was uploaded. Retry uploading with the create new version option",
          }),
      } as AddJobSubscription);
    }
  }, [specificationId, relationshipData?.relationshipId]);

  useEffect(() => {
    if (!specificationId) return;
    if (!subs || !subs.some((s) => s.filterBy.jobTypes?.includes(JobType.RunConverterDatasetMergeJob))) {
      addSub({
        fetchPriorNotifications: true,
        filterBy: {
          specificationId: specificationId,
          jobTypes: [JobType.RunConverterDatasetMergeJob],
        },
        monitorMode: MonitorMode.SignalR,
        monitorFallback: MonitorFallback.Polling,
        onError: (err) =>
          addError({
            error: err,
            description: "Error while checking for converter wizard running jobs",
          }),
      } as AddJobSubscription);
    }

    return () => removeAllSubs();
  }, [specificationId]);

  function changeDataset(newValue: string) {
    if (!selection.dataset || newValue !== selection.dataset.id) {
      const dataset = relationshipData?.datasets.find((x) => x.id === newValue);

      // auto select version if only one exists
      if (dataset && dataset.versions.length === 1) {
        setSelection({
          dataset: dataset,
          version: dataset.versions[0].version,
        });
      } else {
        setSelection({ dataset: dataset, version: undefined });
      }

      setVersionsPage(1);
    }
  }

  function changeVersion(datasetId: string, newVersion: number) {
    if (newVersion !== selection.version) {
      if (!selection.dataset) {
        throw new Error("Error: selecting version without a selected dataset");
      }
      setSelection({ dataset: selection.dataset, version: newVersion });
    }
  }

  function cancel() {
    if (isViewingAllVersions) {
      setIsViewingAllVersions(false);
    } else {
      history.goBack();
    }
  }

  function expandToViewAllVersions(datasetId: string) {
    if (!selection.dataset || selection.dataset.id !== datasetId) {
      const previouslySelected = relationshipData?.datasets.find(
        (x) => x.id === datasetId && !!x.selectedVersion
      );
      setSelection({
        dataset: relationshipData?.datasets.find((x) => x.id === datasetId),
        version: previouslySelected?.selectedVersion,
      });
    }
    setIsViewingAllVersions(true);
    setVersionsPage(1);
  }

  function contractToViewAllDataSets() {
    setIsViewingAllVersions(false);
  }

  function validateForm() {
    clearErrorMessages();
    const validations = [
      validate(() => !!selection?.dataset, {
        fieldName: "dataset",
        error: "Please select a data set",
        description: "No selection has been made",
      }),
      validate(() => !!selection?.version, {
        fieldName: "version",
        error: "Please select a version",
        description: "No selection has been made",
      }),
    ];

    return validations.every((func) => func);
  }

  async function changeSpecificationDataMapping() {
    if (!validateForm()) {
      return;
    }

    setIsUpdating(true);
    datasetService
      .assignDataSourceService(
        relationshipData?.relationshipId as string,
        specification?.id as string,
        `${selection?.dataset?.id}_${selection?.version}`
      )
      .catch((err) =>
        addError({
          error: err,
          description: "An error was encountered whilst trying to save changes",
          suggestion: "Please check and try again.",
        })
      )
      .finally(() => setIsUpdating(false));
  }

  const specificationName =
    !isLoadingSpecification && specification && specification.name?.length > 0
      ? specification.name
      : "Specification";
  const isBusy = isUpdating || jobNotifications.some((n) => n.latestJob?.isActive);

  return (
    <Main location={Section.Datasets}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"} />
        <Breadcrumb
          name={"Map data source files to datasets for a specification"}
          url={"/Datasets/MapDataSourceFiles"}
        />
        {specification && (
          <Breadcrumb name={specificationName} url={`/Datasets/DataRelationships/${specification.id}`} />
        )}
        <Breadcrumb name={`Change ${specificationName}`} />
      </Breadcrumbs>
      <PermissionStatus
        requiredPermissions={missingPermissions}
        hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}
      />
      <MultipleErrorSummary errors={errors} />
      <JobNotifications jobNotifications={jobNotifications} />
      <LoadingStatusNotifier
        notifications={[
          {
            isActive: isLoadingRelationshipData || !relationshipData,
            title: "Loading data sources...",
          },
          {
            isActive: isLoadingSpecification || !specification,
            title: "Loading specification...",
          },
          {
            isActive: isCheckingForPermissions,
            title: "Checking your permissions....",
          },
          { isActive: isUpdating, title: "Assigning version to dataset...." },
        ]}
      />
      <section>
        {specification && (
          <Title title={specification.name} titleCaption={specification.fundingPeriod?.name} />
        )}
        {!isBusy && (relationshipData?.datasets?.length === 1 || isViewingAllVersions) && (
          <h3 className="govuk-heading-m govuk-!-margin-top-2">
            {selection.dataset?.name}
            <span className="govuk-hint">
              <strong>Description:</strong>
              {selection.dataset?.description}
            </span>
          </h3>
        )}
      </section>
      <section>
        <DataSourceSelectionForm
          isLoading={!relationshipData || !specification || isCheckingForPermissions}
          isBusy={isBusy}
          isSearchingForDataSetVersions={isSearchingForDataSetVersions}
          hasMissingPermissions={hasMissingPermissions}
          isViewingAllVersions={isViewingAllVersions}
          relationshipData={relationshipData}
          originalSelection={originalSelection}
          selection={selection}
          datasetVersionSearchResponse={datasetVersionSearchResponse}
          onVersionChanged={changeVersion}
          expandToViewAllVersions={expandToViewAllVersions}
          contractToViewAllDataSets={contractToViewAllDataSets}
          onSave={changeSpecificationDataMapping}
          onCancel={cancel}
          setVersionsPage={setVersionsPage}
          onChangeDataset={changeDataset}
        />
      </section>
    </Main>
  );
};

const JobNotifications = (props: { jobNotifications: JobNotification[] | undefined }) => {
  if (!props.jobNotifications?.some((n) => n.latestJob?.isActive)) return null;
  return (
    <div className="govuk-form-group">
      {props.jobNotifications
        .filter((n) => n.latestJob?.isActive)
        .map((n, idx) => (
          <JobBanner key={idx} job={n.latestJob} />
        ))}
      {props.jobNotifications.some(
        (n) => n.latestJob?.isActive && n.latestJob.jobType === JobType.RunConverterDatasetMergeJob
      ) && <WarningText text={"Mapping of this dataset is disabled until converter wizard completes."} />}
    </div>
  );
};
