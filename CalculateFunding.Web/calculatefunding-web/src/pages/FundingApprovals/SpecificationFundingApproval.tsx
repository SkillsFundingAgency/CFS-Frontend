import { AxiosError } from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router";
import { Link } from "react-router-dom";

import { initialiseFundingSearchSelection } from "../../actions/FundingSearchSelectionActions";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { PublishedProviderResults } from "../../components/Funding/ProviderFundingSearch/PublishedProviderResults";
import { PublishedProviderSearchFilters } from "../../components/Funding/ProviderFundingSearch/PublishedProviderSearchFilters";
import JobNotificationSection from "../../components/Jobs/JobNotificationSection";
import { LoadingNotification, LoadingStatusNotifier } from "../../components/LoadingStatusNotifier";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { activeJobs, getJobDetailsFromJobResponse } from "../../helpers/jobDetailsHelper";
import { usePublishedProviderErrorSearch } from "../../hooks/FundingApproval/usePublishedProviderErrorSearch";
import { usePublishedProviderSearch } from "../../hooks/FundingApproval/usePublishedProviderSearch";
import { useJobObserver } from "../../hooks/Jobs/useJobObserver";
import { useJobSubscription } from "../../hooks/Jobs/useJobSubscription";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../hooks/useErrors";
import { useFundingConfiguration } from "../../hooks/useFundingConfiguration";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import { IStoreState } from "../../reducers/rootReducer";
import { getLatestSuccessfulJob } from "../../services/jobService";
import * as publishService from "../../services/publishService";
import { FundingSearchSelectionState } from "../../states/FundingSearchSelectionState";
import { ApprovalMode } from "../../types/ApprovalMode";
import { JobDetails } from "../../types/jobDetails";
import { JobNotification, MonitorFallback, MonitorMode } from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";
import { Permission } from "../../types/Permission";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { Section } from "../../types/Sections";

export interface SpecificationFundingApprovalRouteProps {
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
}

export const SpecificationFundingApproval = ({
  match,
}: RouteComponentProps<SpecificationFundingApprovalRouteProps>): JSX.Element => {
  const fundingStreamId = match.params.fundingStreamId;
  const fundingPeriodId = match.params.fundingPeriodId;
  const specificationId = match.params.specificationId;

  const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(
    (state) => state.fundingSearchSelection
  );
  const isSearchCriteriaInitialised =
    state.searchCriteria !== undefined &&
    state.searchCriteria.specificationId === specificationId &&
    state.searchCriteria.fundingAction === FundingActionType.Approve;

  const {
    addSub,
    removeSub,
    results: jobNotifications,
  } = useJobSubscription({
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring background jobs" }),
  });

  const { monitorObservedJob, isObserving } = useJobObserver({
    addSub,
    removeSub,
    jobNotifications,
    onError: (error: any) => addError({ error: error, description: "Error while monitoring funding jobs" }),
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
      onError: (err) => addError({ error: err, description: "Error while searching for providers" }),
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
    (err) => addError({ error: err, description: "Error while loading provider funding errors" })
  );
  const { missingPermissions, hasPermission, isPermissionsFetched } = useSpecificationPermissions(
    match.params.specificationId,
    [Permission.CanRefreshFunding, Permission.CanApproveFunding, Permission.CanReleaseFunding]
  );
  useQuery<JobDetails | undefined, AxiosError>(
    `last-spec-${specificationId}-refresh`,
    async () =>
      getJobDetailsFromJobResponse(
        (await getLatestSuccessfulJob(specificationId, JobType.RefreshFundingJob)).data
      ),
    {
      cacheTime: 0,
      refetchOnWindowFocus: false,
      enabled: specificationId !== undefined && specificationId.length > 0,
      onSettled: (data) => setLastRefresh(data?.lastUpdated),
      onError: (err) => addError({ error: err, description: "Error while loading last refresh date" }),
    }
  );
  const [isLoadingRefresh, setIsLoadingRefresh] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string>("");
  const [lastRefresh, setLastRefresh] = useState<Date | undefined>();
  const { errors, addErrorMessage, addError, addValidationErrors, clearErrorMessages } = useErrors();
  const hasPermissionToRefresh: boolean = useMemo(
    () => hasPermission && !!hasPermission(Permission.CanRefreshFunding),
    [isPermissionsFetched]
  );
  const hasPermissionToApprove: boolean = useMemo(
    () => hasPermission && !!hasPermission(Permission.CanApproveFunding),
    [isPermissionsFetched]
  );
  const hasPermissionToRelease: boolean = useMemo(
    () => hasPermission && !!hasPermission(Permission.CanReleaseFunding),
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
          match.params.specificationId,
          FundingActionType.Approve
        )
      );
    }
    monitorObservedJob(handleObservedJobCompleted);

    addJobTypeSubscription([JobType.RefreshFundingJob]);
    addJobTypeSubscription([JobType.ApproveAllProviderFundingJob, JobType.ApproveBatchProviderFundingJob]);
    addJobTypeSubscription([
      JobType.PublishBatchProviderFundingJob,
      JobType.PublishAllProviderFundingJob,
      JobType.ReIndexPublishedProvidersJob,
    ]);
    addJobTypeSubscription([
      JobType.CreateInstructAllocationJob,
      JobType.GenerateGraphAndInstructGenerateAggregationAllocationJob,
      JobType.GenerateGraphAndInstructAllocationJob,
    ]);
  }, [match, isSearchCriteriaInitialised]);

  useEffect(() => {
    const completedRefreshJob = jobNotifications.find(
      (n) => n.latestJob?.isComplete && n.latestJob?.jobType === JobType.RefreshFundingJob
    )?.latestJob;
    if (completedRefreshJob) {
      setIsLoadingRefresh(false);
      setLastRefresh(completedRefreshJob.lastUpdated);
    }
    if (
      jobId !== "" &&
      jobNotifications.some((n) => n.latestJob?.isComplete && n.latestJob?.jobId === jobId)
    ) {
      setIsLoadingRefresh(false);
      setJobId("");
      refetchSearchResults();
    }
  }, [jobNotifications, jobId]);

  const handleObservedJobCompleted = (notification: JobNotification) => {
    const observedJob = notification?.latestJob;
    if (!observedJob || observedJob.isActive) return;
    if (observedJob.isComplete) {
      if (observedJob.isFailed) {
        addError({
          error: observedJob.outcome ?? "An unknown error occurred",
          description: "A background job failed",
        });
      }
      if (observedJob.isSuccessful) {
        refetchSearchResults();
      }
    }
  };

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
        addError({ error: err, description: "An error occurred while monitoring a background job" }),
    });
  }

  function handleApprove() {
    if (
      publishedProviderSearchResults &&
      hasPermissionToApprove &&
      publishedProviderSearchResults.canApprove
    ) {
      if (
        fundingConfiguration?.approvalMode === ApprovalMode.All &&
        publishedProvidersWithErrors &&
        publishedProvidersWithErrors.length > 0
      ) {
        addErrorMessage(
          "Funding cannot be approved as there are providers in error",
          undefined,
          undefined,
          "Please filter by error status to identify affected providers"
        );
      } else {
        history.push(
          `/Approvals/ConfirmFunding/${fundingStreamId}/${fundingPeriodId}/${specificationId}/${FundingActionType.Approve}`
        );
      }
    }
  }

  async function handleRelease() {
    if (
      publishedProviderSearchResults &&
      publishedProviderSearchResults.canPublish &&
      hasPermissionToRelease
    ) {
      if (
        fundingConfiguration?.approvalMode === ApprovalMode.All &&
        publishedProvidersWithErrors &&
        publishedProvidersWithErrors.length > 0
      ) {
        addErrorMessage(
          "Funding cannot be released as there are providers in error",
          undefined,
          undefined,
          "Please filter by error status to identify affected providers"
        );
      } else {
        history.push(
          `/Approvals/ConfirmFunding/${fundingStreamId}/${fundingPeriodId}/${specificationId}/${FundingActionType.Release}`
        );
      }
    }
  }

  async function handleRefresh() {
    clearErrorMessages();

    try {
      setIsLoadingRefresh(true);
      await publishService.preValidateForRefreshFundingService(specificationId);
      setIsLoadingRefresh(false);

      ConfirmationModal(<ConfirmRefreshModelBody />, refreshFunding, "Confirm", "Cancel");
    } catch (error: any) {
      window.scrollTo(0, 0);
      const axiosError = error as AxiosError;
      if (axiosError && axiosError.response && axiosError.response.status === 400) {
        addValidationErrors({
          validationErrors: axiosError.response.data,
          message: "Error trying to refresh funding",
        });
      } else {
        addError({ error: error, description: "Error trying to refresh funding" });
      }
    }
    setIsLoadingRefresh(false);
  }

  async function refreshFunding() {
    setIsLoadingRefresh(true);
    try {
      setJobId((await publishService.refreshSpecificationFundingService(specificationId)).data);
    } catch (e) {
      addErrorMessage(e, "Error trying to refresh funding");
    } finally {
      setIsLoadingRefresh(false);
    }
  }

  const ConfirmRefreshModelBody = () => {
    return (
      <div className="govuk-grid-column-full left-align">
        <h1 className="govuk-heading-l">Confirm funding refresh</h1>
        <p className="govuk-body">A refresh of funding will update the following data:</p>
        <ul className="govuk-list govuk-list--bullet">
          <li>Allocation values</li>
          <li>Profile values</li>
        </ul>
        <p className="govuk-body">
          This update will affect providers in specification {specification?.name} for the funding stream{" "}
          {specification?.fundingStreams[0].name} and period {specification?.fundingPeriod.name}.
        </p>
      </div>
    );
  };

  const clearFundingSearchSelection = () => {
    dispatch(
      initialiseFundingSearchSelection(
        fundingStreamId,
        fundingPeriodId,
        specificationId,
        FundingActionType.Approve
      )
    );
  };

  useEffect(() => {
    if (publishedProvidersWithErrors) {
      publishedProvidersWithErrors.forEach((err) => addError({ error: err, description: "Provider error" }));
    }
  }, [publishedProvidersWithErrors]);

  const isLoading =
    !isSearchCriteriaInitialised ||
    isLoadingSpecification ||
    isLoadingFundingConfiguration ||
    isLoadingSearchResults ||
    isLoadingRefresh ||
    isObserving;

  const haveAnyProviderErrors =
    isLoadingPublishedProviderErrors ||
    (publishedProvidersWithErrors && publishedProvidersWithErrors.length > 0);

  const blockActionBasedOnProviderErrors =
    fundingConfiguration?.approvalMode === ApprovalMode.All && haveAnyProviderErrors;

  const activeActionJobs = activeJobs(actionJobs);
  const hasActiveActionJobs = !!activeActionJobs.length;

  const disableRefresh: boolean = !hasPermissionToRefresh || isLoadingRefresh || hasActiveActionJobs;

  return (
    <Main location={Section.FundingManagement}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"Approvals"} />
        <Breadcrumb name={"Select specification"} url={"/Approvals/Select"} />
      </Breadcrumbs>

      <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched} />

      <MultipleErrorSummary errors={errors} specificationId={specificationId} />

      {!activeActionJobs?.length && (
        <>
          <JobNotificationSection
            jobNotifications={jobNotifications}
            notificationSettings={[
              {
                jobTypes: [
                  JobType.RefreshFundingJob,
                  JobType.ApproveAllProviderFundingJob,
                  JobType.ApproveBatchProviderFundingJob,
                  JobType.PublishBatchProviderFundingJob,
                  JobType.PublishAllProviderFundingJob,
                  JobType.ReIndexPublishedProvidersJob,
                ],
                showActive: false, // we show a spinner separately
                showFailed: true,
                showSuccessful: true,
              },
            ]}
          />
          <JobNotificationSection
            jobNotifications={jobNotifications}
            notificationSettings={[
              {
                jobTypes: [
                  JobType.CreateInstructAllocationJob,
                  JobType.GenerateGraphAndInstructGenerateAggregationAllocationJob,
                  JobType.GenerateGraphAndInstructAllocationJob,
                ],
                showActive: true,
                showFailed: true,
                showSuccessful: false,
                activeDescription: "Calculation run in progress",
                failDescription: "Calculation run failed",
              },
            ]}
          />
        </>
      )}

      {!isLoadingSpecification && specification && (
        <div className="govuk-grid-row govuk-!-margin-bottom-5">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-1" data-testid="specName">
              {specification.name}
            </h1>
            {specification?.fundingStreams?.length > 0 && specification?.fundingPeriod?.name && (
              <span className="govuk-caption-l" data-testid="fundingDetails">
                {specification.fundingStreams[0].name} for {specification && specification.fundingPeriod.name}
              </span>
            )}
          </div>
          <div className="govuk-grid-column-one-third">
            <ul className="govuk-list right-align">
              <li>
                <Link className={"govuk-link"} to={`/ViewSpecification/${specification?.id}`}>
                  Manage specification
                </Link>
              </li>
              {fundingConfiguration && fundingConfiguration.approvalMode === ApprovalMode.Batches && (
                <li>
                  <Link
                    className="govuk-link govuk-link--no-visited-state"
                    to={`/Approvals/UploadBatch/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
                  >
                    Upload batch file of providers
                  </Link>
                </li>
              )}
              <li>
                <Link
                  className="govuk-link govuk-link--no-visited-state"
                  to={`/ViewSpecificationResults/${specificationId}?initialTab=downloadable-reports`}
                >
                  Specification reports
                </Link>
              </li>
              <li>
                <button
                  className="govuk-link govuk-!-margin-right-1 govuk-link--no-visited-state"
                  disabled={disableRefresh}
                  onClick={handleRefresh}
                >
                  Refresh funding
                </button>
              </li>

              {lastRefresh && (
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Last refresh <DateTimeFormatter date={lastRefresh as Date} />
                </p>
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="govuk-grid-row">
        {!hasActiveActionJobs && (
          <div className="govuk-grid-column-one-third">
            <PublishedProviderSearchFilters
              facets={publishedProviderSearchResults ? publishedProviderSearchResults.facets : []}
              numberOfProvidersWithErrors={0}
              clearFundingSearchSelection={clearFundingSearchSelection}
            />
          </div>
        )}
        <div className="govuk-grid-column-two-thirds">
          {(isLoading || hasActiveActionJobs) && (
            <div>
              <LoadingStatusNotifier
                notifications={[
                  {
                    isActive: isLoadingSpecification,
                    title: "Loading specification...",
                    description: "Updating, please wait",
                  },
                  {
                    isActive: isLoadingRefresh,
                    title: "Requesting refresh of funding...",
                    description: "Updating, please wait",
                  },
                  ...activeActionJobs.map<LoadingNotification>((job) => {
                    return {
                      title: `Job ${job.statusDescription}: ${job.jobDescription}`,
                      description: job.isActive
                        ? "Monitoring job progress. Please wait, this could take several minutes"
                        : "",
                    };
                  }),
                  {
                    isActive: isLoadingSearchResults,
                    title: "Loading provider funding data...",
                  },
                  {
                    isActive: isLoadingFundingConfiguration,
                    title: "Loading funding configuration...",
                  },
                ]}
              />
            </div>
          )}
          {!hasActiveActionJobs &&
            !isLoadingRefresh &&
            !isLoadingSearchResults &&
            !isLoadingSpecification &&
            specification && (
              <PublishedProviderResults
                specificationId={specificationId}
                fundingStreamId={fundingStreamId}
                fundingPeriodId={fundingPeriodId}
                specCoreProviderVersionId={specification.providerVersionId}
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
                setIsLoadingRefresh={setIsLoadingRefresh}
                addError={addErrorMessage}
                clearErrorMessages={clearErrorMessages}
              />
            )}
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full right-align">
          <div className="right-align">
            <button
              className="govuk-button govuk-!-margin-right-1"
              disabled={disableRefresh}
              onClick={handleRefresh}
            >
              Refresh funding
            </button>
            <button
              className="govuk-button"
              disabled={
                hasActiveActionJobs ||
                !publishedProviderSearchResults?.canApprove ||
                !hasPermissionToApprove ||
                isLoadingRefresh ||
                blockActionBasedOnProviderErrors
              }
              onClick={handleApprove}
            >
              Approve funding
            </button>
            <button
              className="govuk-button govuk-button--warning govuk-!-margin-right-1"
              disabled={
                hasActiveActionJobs ||
                !publishedProviderSearchResults?.canPublish ||
                !hasPermissionToRelease ||
                isLoadingRefresh ||
                blockActionBasedOnProviderErrors
              }
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
