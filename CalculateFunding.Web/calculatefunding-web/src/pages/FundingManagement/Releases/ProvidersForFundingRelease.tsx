import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router";

import { initialiseFundingSearchSelection } from "../../../actions/FundingSearchSelectionActions";
import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import { FundingSelectionBreadcrumb } from "../../../components/Funding/FundingSelectionBreadcrumb";
import { ProviderResultsTable } from "../../../components/Funding/ProviderFundingSearch/ProviderResultsTable";
import { PublishedProviderSearchFilters } from "../../../components/Funding/ProviderFundingSearch/PublishedProviderSearchFilters";
import { LoadingStatusNotifier } from "../../../components/LoadingStatusNotifier";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../../components/PermissionStatus";
import { TextLink } from "../../../components/TextLink";
import { Title } from "../../../components/Title";
import { activeJobs } from "../../../helpers/jobDetailsHelper";
import { usePublishedProviderErrorSearch } from "../../../hooks/FundingApproval/usePublishedProviderErrorSearch";
import { usePublishedProviderSearch } from "../../../hooks/FundingApproval/usePublishedProviderSearch";
import { useJobSubscription } from "../../../hooks/Jobs/useJobSubscription";
import { useSpecificationPermissions } from "../../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../../hooks/useErrors";
import { useFundingConfiguration } from "../../../hooks/useFundingConfiguration";
import { useSpecificationSummary } from "../../../hooks/useSpecificationSummary";
import { IStoreState } from "../../../reducers/rootReducer";
import { FundingSearchSelectionState } from "../../../states/FundingSearchSelectionState";
import { ApprovalMode } from "../../../types/ApprovalMode";
import { JobDetails } from "../../../types/jobDetails";
import { MonitorFallback, MonitorMode } from "../../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../../types/jobType";
import { Permission } from "../../../types/Permission";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { Section } from "../../../types/Sections";

export interface ProvidersForFundingReleaseProps {
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
}

export const ProvidersForFundingRelease = ({
  match,
}: RouteComponentProps<ProvidersForFundingReleaseProps>): JSX.Element => {
  const { fundingStreamId, fundingPeriodId, specificationId } = match.params;

  const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(
    (state) => state.fundingSearchSelection
  );
  const isSearchCriteriaInitialised =
    state.searchCriteria !== undefined && state.searchCriteria.specificationId === specificationId;

  const { addSub, results: jobNotifications } = useJobSubscription({
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring background jobs" }),
  });

  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addErrorMessage(err.message, "Error while loading specification")
  );
  const { fundingConfiguration, isLoadingFundingConfiguration } = useFundingConfiguration(
    fundingStreamId,
    fundingPeriodId,
    (err) => addErrorMessage(err.message, "", "Error while loading funding configuration")
  );
  const {
    publishedProviderSearchResults,
    publishedProviderIds,
    isLoadingSearchResults,
    refetchSearchResults,
  } = usePublishedProviderSearch(
    state.searchCriteria,
    fundingConfiguration && fundingConfiguration.approvalMode,
    {
      onError: (err) =>
        addError({
          error: err,
          description: "Error while searching for providers",
        }),
      enabled:
        (isSearchCriteriaInitialised &&
          state.searchCriteria &&
          state.searchCriteria.fundingStreamId &&
          state.searchCriteria.fundingPeriodId) !== undefined,
    }
  );

  const actionJobs: JobDetails[] = useMemo(
    () =>
      jobNotifications
        .filter(
          (n) =>
            n.latestJob?.jobType === JobType.RefreshFundingJob ||
            n.latestJob?.jobType === JobType.ApproveAllProviderFundingJob ||
            n.latestJob?.jobType === JobType.ApproveBatchProviderFundingJob ||
            n.latestJob?.jobType === JobType.PublishBatchProviderFundingJob ||
            n.latestJob?.jobType === JobType.PublishAllProviderFundingJob
        )
        .map((n) => n.latestJob as JobDetails) || ([] as JobDetails[]),
    [jobNotifications]
  );

  const { publishedProvidersWithErrors, isLoadingPublishedProviderErrors } = usePublishedProviderErrorSearch(
    specificationId,
    (err) =>
      addError({
        error: err,
        description: "Error while loading provider funding errors",
      })
  );
  const { missingPermissions, hasPermission, isPermissionsFetched } = useSpecificationPermissions(
    match.params.specificationId,
    [Permission.CanReleaseFunding]
  );
  const [jobId, setJobId] = useState<string>("");
  const { errors, addErrorMessage, addError } = useErrors();
  const hasPermissionToRelease = useMemo(
    () => hasPermission && hasPermission(Permission.CanReleaseFunding),
    [isPermissionsFetched]
  );

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (!isSearchCriteriaInitialised) {
      dispatch(
        initialiseFundingSearchSelection(
          match.params.fundingStreamId,
          match.params.fundingPeriodId,
          match.params.specificationId
        )
      );
    }

    addJobTypeSubscription([JobType.RefreshFundingJob]);
    addJobTypeSubscription([JobType.ApproveAllProviderFundingJob, JobType.ApproveBatchProviderFundingJob]);
    addJobTypeSubscription([
      JobType.CreateInstructAllocationJob,
      JobType.GenerateGraphAndInstructGenerateAggregationAllocationJob,
      JobType.GenerateGraphAndInstructAllocationJob,
    ]);
  }, [match, isSearchCriteriaInitialised]);

  useEffect(() => {
    if (
      jobId !== "" &&
      jobNotifications.some((n) => n.latestJob?.isComplete && n.latestJob?.jobId === jobId)
    ) {
      setJobId("");
      refetchSearchResults();
    }
  }, [jobNotifications, jobId]);

  function addJobTypeSubscription(jobTypes: JobType[]) {
    addSub({
      filterBy: {
        specificationId: specificationId,
        jobTypes: jobTypes,
      },
      monitorMode: MonitorMode.SignalR,
      monitorFallback: MonitorFallback.Polling,
      fetchPriorNotifications: true,
      onError: (err) =>
        addError({
          error: err,
          description: "An error occurred while monitoring a background job",
        }),
    });
  }

  const clearFundingSearchSelection = () => {
    dispatch(initialiseFundingSearchSelection(fundingStreamId, fundingPeriodId, specificationId));
  };

  if (publishedProvidersWithErrors) {
    publishedProvidersWithErrors.forEach((err) => addErrorMessage(err, "Provider error"));
  }

  const isLoading =
    !isSearchCriteriaInitialised ||
    isLoadingSpecification ||
    isLoadingFundingConfiguration ||
    isLoadingSearchResults;

  const haveAnyProviderErrors =
    isLoadingPublishedProviderErrors ||
    (publishedProvidersWithErrors && publishedProvidersWithErrors.length > 0);

  const blockActionBasedOnProviderErrors =
    fundingConfiguration?.approvalMode === ApprovalMode.All && haveAnyProviderErrors;

  const activeActionJobs = activeJobs(actionJobs);
  const hasActiveActionJobs = !!activeActionJobs.length;

  async function handleRelease() {
    if (
      publishedProviderSearchResults &&
      publishedProviderSearchResults.canPublish &&
      hasPermissionToRelease
    ) {
      if (fundingConfiguration?.approvalMode === ApprovalMode.All && !!publishedProvidersWithErrors?.length) {
        addErrorMessage(
          "Funding cannot be released as there are providers in error",
          undefined,
          undefined,
          "Please filter by error status to identify affected providers"
        );
      } else {
        history.push(
          `/FundingManagement/Release/Purpose/${fundingStreamId}/${fundingPeriodId}/${specificationId}`
        );
      }
    }
  }

  const canRelease =
    !hasActiveActionJobs && publishedProviderSearchResults?.canPublish && hasPermissionToRelease;
  const showUploadBatchAction = canRelease && fundingConfiguration?.approvalMode === ApprovalMode.Batches;

  return (
    <Main location={Section.FundingManagement}>
      <Breadcrumbs>
        <Breadcrumb name="Calculate funding" url={"/"} />
        <Breadcrumb name="Funding management" url={"/FundingManagement"} />
        <FundingSelectionBreadcrumb actionType={FundingActionType.Release} />
        <Breadcrumb name={specification?.fundingStreams[0].name ?? ""} />
      </Breadcrumbs>

      <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched} />
      <MultipleErrorSummary errors={errors} specificationId={specificationId} />

      <div className="govuk-grid-row govuk-!-margin-bottom-2">
        <div className="govuk-grid-column-two-thirds">
          <Title
            title={specification?.name ?? ""}
            titleCaption={
              !specification
                ? ""
                : `${specification?.fundingStreams[0].name} for ${specification.fundingPeriod.name}`
            }
          />
        </div>
        <div className="govuk-grid-column-one-third govuk-right-align">
          {showUploadBatchAction && (
            <nav className="govuk-!-margin-bottom-0" aria-label="Funding Management action links">
              <ul className="govuk-list">
                <li>Actions:</li>
                {showUploadBatchAction && (
                  <li>
                    <TextLink
                      to={`/FundingManagement/Release/UploadBatch/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
                    >
                      Upload batch of providers
                    </TextLink>
                  </li>
                )}
              </ul>
            </nav>
          )}
          <nav className="govuk-!-margin-bottom-0" aria-label="Funding Management other links">
            <ul className="govuk-list">
              <li>Navigate to:</li>
              <li>
                <TextLink
                  to={`/FundingManagement/Approve/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
                >
                  Funding approvals
                </TextLink>
              </li>
              <li>
                <TextLink to={`/ViewSpecification/${specificationId}`}>Manage specification</TextLink>
              </li>
              <li>
                <TextLink to={`/ViewSpecificationResults/${specificationId}?initialTab=downloadable-reports`}>
                  Specification reports
                </TextLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <PublishedProviderSearchFilters
            facets={publishedProviderSearchResults ? publishedProviderSearchResults.facets : []}
            numberOfProvidersWithErrors={0}
            clearFundingSearchSelection={clearFundingSearchSelection}
          />
        </div>
        <div className="govuk-grid-column-two-thirds">
          <LoadingStatusNotifier
            notifications={[
              {
                title: "Loading provider results",
                isActive: isLoading,
                id: "searchLoadingNotification",
              },
            ]}
          />

          {!isLoading && (
            <ProviderResultsTable
              actionType={FundingActionType.Release}
              specCoreProviderVersionId={specification?.providerVersionId}
              enableBatchSelection={fundingConfiguration?.approvalMode === ApprovalMode.Batches}
              providerSearchResults={publishedProviderSearchResults}
              totalResults={
                publishedProviderIds
                  ? publishedProviderIds.length
                  : publishedProviderSearchResults
                  ? publishedProviderSearchResults.totalResults
                  : 0
              }
              allPublishedProviderIds={publishedProviderIds}
            />
          )}
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full right-align">
          <div className="right-align">
            <button
              className="govuk-button govuk-button--warning govuk-!-margin-right-1"
              disabled={!canRelease || !blockActionBasedOnProviderErrors}
              onClick={handleRelease}
            >
              Release funding
            </button>
          </div>
        </div>
      </div>
    </Main>
  );
};
