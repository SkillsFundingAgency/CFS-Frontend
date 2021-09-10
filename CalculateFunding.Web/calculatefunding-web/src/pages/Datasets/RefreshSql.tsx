import { AxiosError } from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { Footer } from "../../components/Footer";
import { Header } from "../../components/Header";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { LoadingStatus } from "../../components/LoadingStatus";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { getJobDetailsFromJobResponse } from "../../helpers/jobDetailsHelper";
import { useOptionsForSpecificationsSelectedForFunding } from "../../hooks/FundingApproval/useOptionsForSpecificationsSelectedForFunding";
import {
  AddJobSubscription,
  JobNotification,
  MonitorFallback,
  MonitorMode,
  useJobSubscription,
} from "../../hooks/Jobs/useJobSubscription";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../hooks/useErrors";
import { getLatestSuccessfulJob } from "../../services/jobService";
import { getLatestPublishedDate, runSqlImportJob } from "../../services/publishService";
import { CompletionStatus } from "../../types/CompletionStatus";
import { JobDetails } from "../../types/jobDetails";
import { JobType } from "../../types/jobType";
import { Permission } from "../../types/Permission";
import { LatestPublishedDate } from "../../types/PublishedProvider/LatestPublishedDate";
import { RunningStatus } from "../../types/RunningStatus";
import { Section } from "../../types/Sections";
import {
  FundingPeriodWithSpecificationSelectedForFunding,
  FundingStreamWithSpecificationSelectedForFunding,
} from "../../types/SpecificationSelectedForFunding";

export function RefreshSql() {
  const { errors, addError } = useErrors();
  const history = useHistory();
  const [sqlJobStatusMessage, setSqlJobStatusMessage] = useState<string>("Data push queued");
  const [fundingStatusMessage, setFundingStatusMessage] = useState<string>("Funding job running");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAnotherUserRunningSqlJob, setIsAnotherUserRunningSqlJob] = useState<boolean>(false);
  const [isAnotherUserRunningFundingJob, setIsAnotherUserRunningFundingJob] = useState<boolean>(false);
  const [refreshJobId, setRefreshJobId] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [refreshJobDateTime, setRefreshJobDateTime] = useState<Date | undefined>();
  const [selectedFundingStream, setSelectedFundingStream] =
    useState<FundingStreamWithSpecificationSelectedForFunding>();
  const [selectedFundingPeriod, setSelectedFundingPeriod] =
    useState<FundingPeriodWithSpecificationSelectedForFunding>();
  const { fundingStreams, isLoadingOptions, errorCheckingForOptions, isErrorCheckingForOptions } =
    useOptionsForSpecificationsSelectedForFunding();
  const specificationId = selectedFundingPeriod ? selectedFundingPeriod.specifications[0].id : "";
  const specificationName = selectedFundingPeriod ? selectedFundingPeriod.specifications[0].name : "";

  const { isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions } =
    useSpecificationPermissions(specificationId, [Permission.CanRefreshPublishedQa]);

  const {
    replaceSubs,
    removeAllSubs,
    results: jobNotifications,
  } = useJobSubscription({
    isEnabled: !!specificationId && specificationId.length > 0,
    onNewNotification: handleJobNotification,
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring background jobs" }),
  });
  const fundingStreamId = selectedFundingStream ? selectedFundingStream.id : "";
  const fundingPeriodId = selectedFundingPeriod ? selectedFundingPeriod.id : "";

  const { data: lastSqlJob, isLoading: isCheckingForLatestSqlJob } = useQuery<
    JobDetails | undefined,
    AxiosError
  >(
    `last-successful-sql-job-${specificationId}-runsqljob`,
    async () =>
      getJobDetailsFromJobResponse(
        (await getLatestSuccessfulJob(specificationId, JobType.RunSqlImportJob)).data
      ),
    {
      enabled: specificationId !== undefined && specificationId.length > 0,
      onError: (err) => addError({ error: err, description: "Error while loading last successful sql job" }),
    }
  );

  const hasRunningFundingJobs: boolean = useMemo(
    () =>
      !!jobNotifications.find(
        ({ latestJob: job }) =>
          !!job?.jobType &&
          job.jobType !== JobType.RunSqlImportJob &&
          job.isActive &&
          job.specificationId === specificationId
      ),
    [jobNotifications]
  );
  const hasRunningSqlJob: boolean = useMemo(
    () =>
      !!jobNotifications.find(
        ({ latestJob: job }) =>
          !!job?.jobType &&
          job.jobType === JobType.RunSqlImportJob &&
          job.isActive &&
          job.specificationId === specificationId
      ),
    [jobNotifications]
  );

  const fetchLatestPublishedDate = async () => {
    if (!fundingStreamId || !fundingPeriodId)
      return {
        value: null,
      };
    return (await getLatestPublishedDate(fundingStreamId, fundingPeriodId)).data;
  };

  const {
    data: latestPublishedDate,
    isLoading: isLoadingLatestPublishedDate,
    refetch: refetchLatestPubDate,
  } = useQuery<LatestPublishedDate, AxiosError>(
    `latest-published-date-${fundingStreamId}-${fundingPeriodId}`,
    fetchLatestPublishedDate,
    {
      onError: (err) => addError({ error: err, description: "Error while loading latest published date." }),
      enabled: false,
    }
  );

  useEffect(() => {
    refetchLatestPubDate();
  }, [selectedFundingPeriod]);

  useEffect(() => {
    if (hasRunningSqlJob && !isAnotherUserRunningSqlJob) {
      setIsAnotherUserRunningSqlJob(true);
    }
    if (!hasRunningSqlJob && isAnotherUserRunningSqlJob) {
      setIsAnotherUserRunningSqlJob(false);
    }
  }, [hasRunningSqlJob, isAnotherUserRunningSqlJob]);

  useEffect(() => {
    if (errorCheckingForOptions.length > 0) {
      addError({ error: errorCheckingForOptions });
    }
  }, [errorCheckingForOptions]);

  useEffect(() => {
    if (!specificationId) return;

    // separate subscriptions because this is for monitoring other people's jobs and the current user's sql import job
    replaceSubs(
      [
        JobType.RunSqlImportJob,
        JobType.ApproveBatchProviderFundingJob,
        JobType.ApproveAllProviderFundingJob,
        JobType.RefreshFundingJob,
        JobType.PublishAllProviderFundingJob,
        JobType.PublishBatchProviderFundingJob,
        JobType.ReIndexPublishedProvidersJob,
      ].map((jobType) => {
        return {
          filterBy: {
            specificationId: specificationId,
            jobTypes: [jobType],
          },
          monitorMode: MonitorMode.SignalR,
          monitorFallback: MonitorFallback.Polling,
          onError: (err) =>
            addError({
              error: err,
              description: "An error occurred while monitoring the running jobs",
            }),
        } as AddJobSubscription;
      })
    );
    return () => {
      removeAllSubs();
    };
  }, [specificationId]);

  function handleJobNotification(notification: JobNotification) {
    if (!notification.latestJob?.jobType) return;
    if (notification.latestJob.jobType === JobType.RunSqlImportJob) {
      handleSqlImportJob(notification);
    } else {
      handleOtherJobs(notification);
    }
  }

  function handleSqlImportJob(notification: JobNotification) {
    if (!notification.latestJob) return;
    if (refreshJobId.length === 0 && !isAnotherUserRunningSqlJob) {
      setIsAnotherUserRunningSqlJob(true);
    }
    console.log(
      `SQL import job with id: ${notification.latestJob.jobId}, status: ${notification.latestJob.statusDescription}, type: ${notification.latestJob.jobType}, invoked by: ${notification.latestJob.invokerUserDisplayName}`
    );
    switch (notification.latestJob.runningStatus) {
      case RunningStatus.Queued:
      case RunningStatus.QueuedWithService:
        setSqlJobStatusMessage("Data push queued");
        break;
      case RunningStatus.InProgress:
        setSqlJobStatusMessage("Data push in progress");
        break;
      case RunningStatus.Completing:
        setSqlJobStatusMessage("Data push completing");
        break;
      case RunningStatus.Completed:
        setSqlJobStatusMessage("Data push completed");
        setIsAnotherUserRunningSqlJob(false);
        if (notification.latestJob.isSuccessful) {
          setRefreshJobDateTime(notification.latestJob.lastUpdated);
        } else {
          setSqlJobStatusMessage("Data push failed");
        }
        if (refreshJobId.length > 0 && notification.latestJob.jobId === refreshJobId) {
          setIsRefreshing(false);
          if (notification.latestJob.isSuccessful) {
            setShowSuccess(true);
          } else {
            addError({ error: "Refresh sql job failed: " + notification.latestJob.outcome });
          }
          setRefreshJobId("");
        }
        break;
    }
  }

  function handleOtherJobs(notification: JobNotification) {
    if (!notification.latestJob) return;
    if (!isAnotherUserRunningFundingJob) {
      setIsAnotherUserRunningFundingJob(true);
    }
    console.log(
      `${notification.latestJob.jobDescription} job with id: ${notification.latestJob.jobId}, status: ${notification.latestJob.statusDescription}, type: ${notification.latestJob.jobType}, invoked by: ${notification.latestJob.invokerUserDisplayName}`
    );
    switch (notification.latestJob.runningStatus) {
      case RunningStatus.Queued:
      case RunningStatus.QueuedWithService:
        setFundingStatusMessage("Job queued");
        break;
      case RunningStatus.InProgress:
        setFundingStatusMessage("Job in progress");
        break;
      case RunningStatus.Completing:
        setFundingStatusMessage("Job completing");
        break;
      case RunningStatus.Completed:
        setFundingStatusMessage("Job completed");
        setIsAnotherUserRunningFundingJob(false);
        refetchLatestPubDate();
        break;
    }
  }

  function handleChangeFundingStream(e: React.ChangeEvent<HTMLSelectElement>) {
    if (fundingStreams) {
      setSelectedFundingStream(fundingStreams.find((stream) => stream.id === e.target.value));
      setSelectedFundingPeriod(undefined);
    }
  }

  function handleChangeFundingPeriod(e: React.ChangeEvent<HTMLSelectElement>) {
    if (selectedFundingStream) {
      setSelectedFundingPeriod(selectedFundingStream.periods.find((period) => period.id === e.target.value));
    }
  }

  function handlePushData() {
    async function pushData() {
      if (!selectedFundingStream) {
        throw new Error("A funding stream has not been selected.");
      }
      if (specificationId.length === 0) {
        throw new Error("The specification id has not been set.");
      }
      try {
        setIsRefreshing(true);
        const jobId = (await runSqlImportJob(specificationId, selectedFundingStream.id)).data.jobId;
        if (!jobId || jobId?.length === 0) {
          setIsRefreshing(false);
          throw new Error("No job ID was returned");
        }
        console.log(`Refresh job queued with id ${jobId}`);
        setRefreshJobId(jobId);
      } catch (error: any) {
        addError({ error: "The refresh sql import job could not be started: " + error.message });
        setIsRefreshing(false);
      }
    }

    pushData();
  }

  function handleContinueClick() {
    history.push("/");
  }

  function LastSqlUpdate() {
    if (isCheckingForLatestSqlJob) {
      return <LoadingFieldStatus title="Loading..." />;
    }
    if (isAnotherUserRunningSqlJob) {
      return <LoadingFieldStatus title={sqlJobStatusMessage} />;
    }
    if (refreshJobDateTime) {
      return <DateTimeFormatter date={refreshJobDateTime} />;
    }
    if (!lastSqlJob || !lastSqlJob.lastUpdated) {
      return <span className="govuk-body">N/A</span>;
    }
    const previousJobFailed = lastSqlJob.completionStatus !== CompletionStatus.Succeeded;

    return (
      <>
        <DateTimeFormatter date={lastSqlJob.lastUpdated} />
        <span className="govuk-body">{previousJobFailed ? " (Failed)" : ""}</span>
      </>
    );
  }

  function LastFundingDateChange() {
    if (isLoadingLatestPublishedDate) {
      return <LoadingFieldStatus title="Loading..." />;
    }
    if (isAnotherUserRunningFundingJob || hasRunningFundingJobs) {
      return <LoadingFieldStatus title={fundingStatusMessage} />;
    }
    if (!latestPublishedDate || latestPublishedDate.value === null) {
      return <span className="govuk-body">N/A</span>;
    }
    return <DateTimeFormatter date={latestPublishedDate.value} />;
  }

  function SqlJobStatusPanel() {
    if (!isRefreshing) {
      return null;
    }

    return (
      <LoadingStatus
        title={sqlJobStatusMessage}
        subTitle="Please wait, this could take several minutes"
        description="Please do not refresh the page, you will be redirected automatically"
        hidden={!isRefreshing}
      />
    );
  }

  function SuccessMessage() {
    if (!showSuccess) {
      return null;
    }

    return (
      <>
        <div className="govuk-grid-row ">
          <div className="govuk-grid-column-full">
            <div className="govuk-panel govuk-panel--confirmation ">
              <h1 className="govuk-panel__title">Refresh successful</h1>
            </div>
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <dl className="govuk-summary-list govuk-summary-list--no-border">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Funding stream</dt>
                <dd className="govuk-summary-list__value">{selectedFundingStream?.name}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Funding period</dt>
                <dd className="govuk-summary-list__value">{selectedFundingPeriod?.name}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Specification</dt>
                <dd className="govuk-summary-list__value">{specificationName}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Last SQL update</dt>
                <dd className="govuk-summary-list__value">
                  <DateTimeFormatter date={refreshJobDateTime as Date} />
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Last funding data change</dt>
                <dd className="govuk-summary-list__value">
                  <LastFundingDateChange />
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <button className="govuk-button" onClick={handleContinueClick}>
          Continue
        </button>
      </>
    );
  }

  function RefreshMessage() {
    if (
      latestPublishedDate &&
      lastSqlJob &&
      latestPublishedDate.value !== null &&
      lastSqlJob.lastUpdated &&
      (latestPublishedDate.value <= lastSqlJob.lastUpdated ||
        (refreshJobDateTime && latestPublishedDate.value <= refreshJobDateTime))
    ) {
      return (
        <div className="govuk-inset-text">
          Refresh SQL data is not available as the latest version has already been pushed.
        </div>
      );
    }
    return null;
  }

  function RefreshButton() {
    const jobPreconditionsOk =
      !lastSqlJob?.lastUpdated ||
      !latestPublishedDate?.value ||
      latestPublishedDate.value > lastSqlJob.lastUpdated ||
      lastSqlJob.isFailed;
    const isEnabled =
      !isRefreshing &&
      jobPreconditionsOk &&
      !isCheckingForPermissions &&
      !hasMissingPermissions &&
      !isLoadingOptions &&
      !isLoadingLatestPublishedDate &&
      !isAnotherUserRunningSqlJob &&
      !hasRunningFundingJobs &&
      !isCheckingForLatestSqlJob;

    return (
      <button className="govuk-button" onClick={handlePushData} disabled={!isEnabled}>
        Push data
      </button>
    );
  }

  function showSummaryAndButton() {
    return selectedFundingStream && selectedFundingPeriod && selectedFundingPeriod.specifications.length > 0;
  }

  return (
    <>
      <Header location={Section.Datasets} />
      <div className="govuk-width-container">
        <Breadcrumbs>
          <Breadcrumb name={"Calculate funding"} url={"/"} />
          <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"} />
          <Breadcrumb name={"Refresh SQL"} />
        </Breadcrumbs>

        <SqlJobStatusPanel />
        <SuccessMessage />
        {!isRefreshing && !showSuccess && (
          <div className="govuk-main-wrapper">
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <PermissionStatus
                  requiredPermissions={missingPermissions}
                  hidden={isCheckingForPermissions || !isPermissionsFetched || !hasMissingPermissions}
                />
              </div>
            </div>
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <MultipleErrorSummary errors={errors} />
              </div>
            </div>
            <div className="govuk-grid-row  govuk-!-margin-bottom-9">
              <div className="govuk-grid-column-full">
                <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Refresh SQL</h1>
                <span className="govuk-caption-xl">Refresh SQL funding</span>
              </div>
            </div>
            {!isErrorCheckingForOptions && (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="sort">
                  Funding stream
                </label>
                {!isLoadingOptions && fundingStreams && fundingStreams.length > 0 ? (
                  <select
                    className="govuk-select"
                    id="funding-streams"
                    name="sort"
                    data-testid="funding-stream"
                    onChange={handleChangeFundingStream}
                  >
                    <option>Please select</option>
                    {fundingStreams.map((fs) => (
                      <option key={fs.id} value={fs.id}>
                        {fs.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <LoadingFieldStatus title={"Loading funding streams..."} />
                )}
              </div>
            )}
            {!isLoadingOptions && selectedFundingStream && (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="sort">
                  Funding period
                </label>
                <select
                  className="govuk-select"
                  id="funding-periods"
                  data-testid={"funding-period"}
                  onChange={handleChangeFundingPeriod}
                >
                  <option>Please select</option>
                  {selectedFundingStream.periods.map((fp) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {showSummaryAndButton() && (
              <>
                <div className="govuk-grid-row">
                  <div className="govuk-grid-column-full">
                    <dl className="govuk-summary-list govuk-summary-list--no-border">
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Specification</dt>
                        <dd className="govuk-summary-list__value">{specificationName}</dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Last SQL update</dt>
                        <dd className="govuk-summary-list__value">
                          <LastSqlUpdate />
                        </dd>
                      </div>
                      <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">Last funding data change</dt>
                        <dd className="govuk-summary-list__value">
                          <LastFundingDateChange />
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                <RefreshMessage />
                <RefreshButton />
              </>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
