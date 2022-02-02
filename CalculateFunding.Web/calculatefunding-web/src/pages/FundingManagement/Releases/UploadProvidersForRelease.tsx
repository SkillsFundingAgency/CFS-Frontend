import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { useDispatch } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router";
import { Link } from "react-router-dom";

import * as actions from "../../../actions/FundingSearchSelectionActions";
import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import { FundingSelectionBreadcrumb } from "../../../components/Funding/FundingSelectionBreadcrumb";
import { LoadingStatusNotifier } from "../../../components/LoadingStatusNotifier";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { useJobSubscription } from "../../../hooks/Jobs/useJobSubscription";
import { useErrors } from "../../../hooks/useErrors";
import { useFundingConfiguration } from "../../../hooks/useFundingConfiguration";
import { useSpecificationSummary } from "../../../hooks/useSpecificationSummary";
import { publishedProviderService } from "../../../services/publishedProviderService";
import { HistoryPage } from "../../../types/HistoryPage";
import { JobCreatedResponse } from "../../../types/JobCreatedResponse";
import { MonitorFallback, MonitorMode } from "../../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../../types/jobType";
import { BatchUploadResponse } from "../../../types/PublishedProvider/BatchUploadResponse";
import { BatchValidationRequest } from "../../../types/PublishedProvider/BatchValidationRequest";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { Section } from "../../../types/Sections";

export interface UploadBatchRouteProps {
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
}

export function UploadProvidersForRelease({ match }: RouteComponentProps<UploadBatchRouteProps>) {
  const { fundingStreamId, fundingPeriodId, specificationId } = match.params;
  const [fileName, setFileName] = useState<string>("");
  const [theFile, setTheFile] = useState<File>();
  const [jobId, setJobId] = useState<string | undefined>();
  const [batchId, setBatchId] = useState<string | undefined>();
  const [isUpdating, setIsUpdating] = useState<boolean>();
  const [isWaitingForJob, setIsWaitingForJob] = useState<boolean>();
  const history = useHistory();
  const dispatch = useDispatch();
  const { errors, addError, clearErrorMessages } = useErrors();
  const currentPage: HistoryPage = {
    title: "Upload batch file",
    path: history.location.pathname,
  };

  const { fundingConfiguration, isLoadingFundingConfiguration } = useFundingConfiguration(
    fundingStreamId,
    fundingPeriodId,
    (err) => addError({ error: err, description: "Error while loading funding configuration" })
  );

  const { addSub, results: jobNotifications } = useJobSubscription({
    isEnabled: true,
    onError: (err) => addError({ error: err, description: "Error checking for background jobs running" }),
  });

  useEffect(() => {
    addJobTypeSubscription([
      JobType.BatchPublishedProviderValidationJob,
      JobType.RefreshFundingJob,
      JobType.ApproveBatchProviderFundingJob,
    ]);
  }, [match]);

  function addJobTypeSubscription(jobTypes: JobType[]) {
    addSub({
      filterBy: {
        specificationId: specificationId,
        jobTypes: jobTypes,
      },
      monitorMode: MonitorMode.SignalR,
      monitorFallback: MonitorFallback.Polling,
      onError: (err) =>
        addError({ error: err, description: "An error occurred while monitoring a background job" }),
    });
  }

  const { mutate: uploadBatchFile, isLoading: isUploadingBatchFile } = useMutation<
    BatchUploadResponse,
    AxiosError,
    File
  >(
    async (theFile) => {
      return (await publishedProviderService.uploadBatchOfPublishedProviders(theFile)).data;
    },
    {
      onError: (err) =>
        addError({ error: err, description: "Error while trying to queue job to validate your batch file" }),
      onSuccess: (data) => {
        setBatchId(data.batchId);
        createValidationJob({
          batchId: data.batchId,
          specificationId: specificationId,
          fundingStreamId: fundingStreamId,
          fundingPeriodId: fundingPeriodId,
        });
      },
    }
  );

  const { data: publishedProviderIds, isLoading: isExtractingProviderIds } = useQuery<string[], AxiosError>(
    `batch-${batchId}-publishedProviderIds`,
    async () => (await publishedProviderService.getPublishedProvidersByBatch(batchId as string)).data,
    {
      enabled:
        batchId !== undefined &&
        jobId !== undefined &&
        jobNotifications.some((j) => j.latestJob?.jobId === jobId && j.latestJob?.isSuccessful),
      cacheTime: 0,
      staleTime: 0,
    }
  );

  const { mutate: createValidationJob, isLoading: isCreatingValidationJob } = useMutation<
    JobCreatedResponse,
    AxiosError,
    BatchValidationRequest
  >(
    async (request) => {
      return (await publishedProviderService.validatePublishedProvidersByBatch(request)).data;
    },
    {
      onError: (err) =>
        addError({ error: err, description: "Error while trying to create job to validate your batch file" }),
      onSuccess: (data) => {
        setJobId(data.jobId);
        setIsWaitingForJob(true);
      },
    }
  );

  const getFileToUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null) {
      const file: File = e.target.files[0];
      setFileName(file.name);
      setTheFile(file);
    }
  };

  const uploadForApprove = async () => {
    setIsUpdating(true);
    clearErrorMessages();
    await uploadBatchFile(theFile as File);
  };

  const latestJob = jobNotifications.find((j) => j.latestJob && j.latestJob.jobId === jobId)?.latestJob;

  useEffect(() => {
    if (!latestJob) return;

    if (isWaitingForJob) {
      setIsWaitingForJob(false);
    }

    if (latestJob.isFailed) {
      addError({ error: latestJob.outcome ? latestJob.outcome : "", description: "Validation failed" });
      setIsUpdating(false);
      setFileName("");
    } else if (latestJob.isSuccessful && publishedProviderIds) {
      dispatch(actions.initialiseFundingSearchSelection(fundingStreamId, fundingPeriodId, specificationId));
      dispatch(actions.addProvidersToFundingSelection(publishedProviderIds));

      if (
        fundingConfiguration !== undefined &&
        fundingConfiguration.releaseChannels !== undefined &&
        fundingConfiguration.releaseChannels.length > 1
      ) {
        history.push(
          `/FundingManagement/Release/Purpose/${fundingStreamId}/${fundingPeriodId}/${specificationId}/`,
          { previousPage: currentPage }
        );
      } else {
        history.push(
          `/FundingManagement/Release/Confirm/${fundingStreamId}/${fundingPeriodId}/${specificationId}/`,
          { previousPage: currentPage }
        );
      }
    }
  }, [jobNotifications, publishedProviderIds]);

  const { specification } = useSpecificationSummary(specificationId, () =>
    addError({ error: "Error while loading specification" })
  );

  const isBlocked =
    isUpdating ||
    isWaitingForJob ||
    isUploadingBatchFile ||
    isCreatingValidationJob ||
    isExtractingProviderIds ||
    (latestJob && latestJob.jobId === jobId && latestJob.isActive);
  const hasActiveJob = latestJob && latestJob.isActive;
  const hasUsersValidationJobActive = latestJob && latestJob.isActive && latestJob.jobId === jobId;
  const isValidatingOrUploading =
    isUpdating ||
    isUploadingBatchFile ||
    isLoadingFundingConfiguration ||
    isCreatingValidationJob ||
    isWaitingForJob ||
    hasUsersValidationJobActive;

  return (
    <Main location={Section.FundingManagement}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Breadcrumbs>
            <Breadcrumb name="Calculate funding" url="/" />
            <Breadcrumb name="Funding management" url="/FundingManagement" />
            <FundingSelectionBreadcrumb actionType={FundingActionType.Release} />
            <Breadcrumb name={currentPage.title} />
          </Breadcrumbs>
        </div>
      </div>

      <MultipleErrorSummary errors={errors} />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-form-group">
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                <h1 className="govuk-fieldset__heading govuk-!-margin-bottom-5">{currentPage.title}</h1>
              </legend>
              {specification && (
                <dl className="govuk-summary-list govuk-summary-list--no-border">
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      <h2 className="govuk-heading-s govuk-!-margin-bottom-1">
                        {specification.name} selected
                      </h2>
                    </dt>
                  </div>
                </dl>
              )}
              {!isBlocked && (
                <ul className="govuk-list govuk-list--bullet">
                  <li>The file is in xlsx format</li>
                  <li>The file contains one UKPRN column</li>
                  <li>The upload data must be in the first sheet of the xlsx file</li>
                  <li>
                    Providers already approved or released will not be shown in the provider count summaries
                  </li>
                </ul>
              )}
            </fieldset>
          </div>
        </div>
      </div>

      {isBlocked && (
        <LoadingStatusNotifier
          notifications={[
            {
              isActive: isValidatingOrUploading,
              title: "Validating your upload",
            },
            {
              isActive: hasActiveJob,
              title: "Background job is running",
              subTitle:
                latestJob && latestJob.isActive
                  ? `Job ${latestJob.statusDescription}: ${latestJob.jobDescription}`
                  : "",
            },
            {
              isActive: isExtractingProviderIds,
              title: "Extracting providers from file",
            },
            {
              isActive: isUploadingBatchFile,
              title: "Uploading your file...",
            },
            {
              isActive: isCreatingValidationJob,
              title: "Creating job to validate file...",
            },
            {
              isActive: isWaitingForJob,
              title: "Creating job to validate file...",
            },
          ]}
        />
      )}
      {!isBlocked && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="file-upload">
                <strong>Upload an XLSX file</strong>
              </label>
              <input
                className="govuk-file-upload"
                id="file-upload"
                name="file-upload"
                type="file"
                disabled={isBlocked}
                onChange={getFileToUpload}
              />
            </div>
            <button
              className="govuk-button govuk-!-margin-right-1"
              type="button"
              onClick={uploadForApprove}
              disabled={fileName.length === 0 || isBlocked}
              data-module="govuk-button"
            >
              Continue
            </button>
            <Link
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
              to={"/FundingManagementReleaseSelection"}
            >
              Cancel
            </Link>
          </div>
        </div>
      )}
    </Main>
  );
}
