import React, { useMemo } from "react";
import { RouteComponentProps, useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../../components/DateTimeFormatter";
import { LoadingFieldStatus } from "../../../components/LoadingFieldStatus";
import { LoadingStatus } from "../../../components/LoadingStatus";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../../components/PermissionStatus";
import { Title } from "../../../components/Title";
import { convertToSlug } from "../../../helpers/stringHelper";
import {
  JobsInfo,
  SqlExportActions,
  SqlExportState,
  useExportToSqlJobs,
} from "../../../hooks/ExportToSql/useExportToSqlJobs";
import { useSpecificationPermissions } from "../../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../../hooks/useErrors";
import { useSpecificationSummary } from "../../../hooks/useSpecificationSummary";
import { JobDetails } from "../../../types/jobDetails";
import { Permission } from "../../../types/Permission";
import { Section } from "../../../types/Sections";
import { SpecificationSummary } from "../../../types/SpecificationSummary";

enum ExportType {
  CalculationsData,
  LatestFundingData,
  LastReleasedData,
}

export function RunExportToSql({ match }: RouteComponentProps<{ specificationId: string }>) {
  const { errors, addError, clearErrorMessages } = useErrors();
  const specificationId = match.params.specificationId;

  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({
      error: err,
      description: "Error while loading specification",
    })
  );
  const fundingStreamId = specification?.fundingStreams[0]?.id;
  const fundingPeriodId = specification?.fundingPeriod?.id;

  const { jobsInfo, exportState, actions, latestPublishedDate, isLoadingLatestPublishedDate } =
    useExportToSqlJobs({ specificationId, fundingStreamId, fundingPeriodId, addError, clearErrorMessages });

  const { isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions } =
    useSpecificationPermissions(specificationId, [Permission.CanRefreshPublishedQa]);

  const isExportPermitted = !isCheckingForPermissions && !hasMissingPermissions;
  const isLoading = isLoadingSpecification || isLoadingLatestPublishedDate;

  return (
    <Main location={Section.Datasets}>
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name="Manage data" url="/Datasets/ManageData" />
      </Breadcrumbs>

      <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched} />
      <MultipleErrorSummary errors={errors} />

      <Title
        title="Export data to SQL"
        titleCaption={
          specification?.name
            ? `${specification.name} ${specification?.isSelectedForFunding ? "(Chosen for funding)" : ""}`
            : ""
        }
      />

      {isLoadingSpecification || !specification ? (
        <LoadingStatus title="Loading" />
      ) : exportState.isExporting ? (
        <LoadingStatus
          title={exportState.exportJobStatusMessage}
          subTitle="Please wait, this could take several minutes"
          description="Please do not refresh the page, you will be redirected automatically"
        />
      ) : jobsInfo.exportJob?.isSuccessful ? (
        <SuccessMessage
          exportJob={jobsInfo.exportJob}
          isLoadingLatestPublishedDate={isLoadingLatestPublishedDate}
          latestPublishedDate={latestPublishedDate?.value ?? undefined}
          specification={specification as SpecificationSummary}
        />
      ) : (
        (!jobsInfo.exportJob || jobsInfo.exportJob?.isFailed) && (
          <>
            <ExportSection
              type={ExportType.CalculationsData}
              exportState={exportState}
              jobsInfo={jobsInfo}
              isLoading={isLoading}
              actions={actions}
              isExportPermitted={isExportPermitted}
            />

            <ExportSection
              type={ExportType.LatestFundingData}
              exportState={exportState}
              jobsInfo={jobsInfo}
              isSelectedForFunding={specification?.isSelectedForFunding}
              isLoading={isLoading}
              actions={actions}
              isExportPermitted={isExportPermitted}
            />

            <ExportSection
              type={ExportType.LastReleasedData}
              exportState={exportState}
              jobsInfo={jobsInfo}
              isSelectedForFunding={!!specification?.isSelectedForFunding}
              isLoading={isLoading}
              actions={actions}
              isExportPermitted={isExportPermitted}
            />
          </>
        )
      )}
    </Main>
  );
}

const ExportSection = ({
  type,
  exportState,
  isSelectedForFunding,
  jobsInfo,
  actions,
  isLoading,
  isExportPermitted,
}: {
  type: ExportType;
  isSelectedForFunding?: boolean | undefined;
  exportState: SqlExportState;
  jobsInfo: JobsInfo;
  actions: SqlExportActions;
  isLoading: boolean;
  isExportPermitted: boolean;
}) => {
  const { title, description, lastExportJob, lastChangeText, lastChangeDate, isDataAlreadyExported } =
    useMemo(() => {
      switch (type) {
        case ExportType.CalculationsData:
          return {
            title: "Latest calculation results",
            description:
              "Includes funding line, template calculation and additional calculation values for providers from the latest specification calculation run.",
            lastExportJob: jobsInfo.latestCalcResultsExportJob,
            lastChangeText: "Last calculation run",
            lastChangeDate: jobsInfo.latestCalcEngineRunJob?.lastUpdated,
            isDataAlreadyExported: exportState.isLatestCalcResultsAlreadyExported,
          };
        case ExportType.LatestFundingData:
          return {
            title: "Current state allocation results",
            description:
              "Includes funding line, template calculation and profile values for draft, approved, updated and released provider allocations.",
            lastExportJob: jobsInfo.latestExportAllocationDataJob,
            lastChangeText: "Last funding data change",
            lastChangeDate: jobsInfo.lastSuccessfulFundingChangeJob?.lastUpdated,
            isDataAlreadyExported: exportState.isLatestAllocationDataAlreadyExported,
          };
        case ExportType.LastReleasedData:
          return {
            title: "Latest released state allocation results",
            description:
              "Includes the funding line, template calculation and profile values for the latest released version of the provider allocations.",
            lastExportJob: jobsInfo.latestReleasedAllocationExportJob,
            lastChangeText: "Last published",
            lastChangeDate: jobsInfo.latestReleasedAllocationJob?.lastUpdated ?? undefined,
            isDataAlreadyExported: exportState.isLatestReleaseDataAlreadyExported,
          };
        default:
          throw Error("Unknown export type");
      }
    }, [type, jobsInfo, exportState, isSelectedForFunding]);

  const titleId = `${convertToSlug(title)}-title`;
  return (
    <section className="govuk-main-wrapper" aria-describedby={titleId}>
      <h2 id={titleId} className="govuk-heading-l">
        {title}
      </h2>
      <p className="govuk-body">{description}</p>
      <details
        hidden={type !== ExportType.CalculationsData && !isSelectedForFunding}
        className="govuk-details govuk-!-margin-bottom-4"
        data-module="govuk-details"
      >
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">Additional details</span>
        </summary>
        <div className="govuk-details__text">
          <dl className="govuk-summary-list govuk-summary-list--no-border">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Last export to SQL</dt>
              <dd className="govuk-summary-list__value">
                {lastExportJob?.isActive ? (
                  <LoadingFieldStatus title={exportState.exportJobStatusMessage} />
                ) : !lastExportJob?.lastUpdated ? (
                  <span className="govuk-body">N/A</span>
                ) : type === ExportType.CalculationsData && jobsInfo.hasRunningCalcEngineJob ? (
                  <LoadingFieldStatus title="Calculation engine job in progress. Please wait." />
                ) : type !== ExportType.CalculationsData && jobsInfo.hasRunningFundingJobs ? (
                  <LoadingFieldStatus
                    title={`Funding job in progress. Please wait. ${exportState.fundingJobStatusMessage}`}
                  />
                ) : exportState.isAnotherUserExporting ? (
                  <LoadingFieldStatus
                    title={`Another export in progress. Please wait. ${exportState.exportJobStatusMessage}`}
                  />
                ) : (
                  <>
                    <DateTimeFormatter date={lastExportJob.lastUpdated} />
                    <span className="govuk-body">{lastExportJob.isFailed ? " (Failed)" : ""}</span>
                  </>
                )}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">{lastChangeText}</dt>
              <dd className="govuk-summary-list__value">
                {jobsInfo.hasRunningFundingJobs ? (
                  <LoadingFieldStatus title={exportState.fundingJobStatusMessage} />
                ) : !lastChangeDate ? (
                  <span className="govuk-body">N/A</span>
                ) : (
                  <DateTimeFormatter date={lastChangeDate} />
                )}
              </dd>
            </div>
          </dl>
        </div>
      </details>
      {!isSelectedForFunding && type !== ExportType.CalculationsData ? (
        <div className="govuk-inset-text">
          This specification has not been chosen for funding therefore you are unable to create the SQL data.
        </div>
      ) : isDataAlreadyExported ? (
        <div className="govuk-inset-text">SQL data up to date</div>
      ) : type === ExportType.CalculationsData ? (
        <button
          className="govuk-button"
          onClick={actions.triggerCalcResultsExport}
          disabled={isLoading || exportState.isExportBlockedByJob || !isExportPermitted}
        >
          {jobsInfo.latestCalcResultsExportJob ? "Refresh " : "Create "} SQL data
        </button>
      ) : type === ExportType.LatestFundingData ? (
        <button
          className="govuk-button"
          onClick={actions.triggerCurrentAllocationResultsExport}
          disabled={isLoading || exportState.isCurrentAllocationStateBlockedByJob || !isExportPermitted}
        >
          {jobsInfo.latestExportAllocationDataJob ? "Refresh " : "Create "} SQL data
        </button>
      ) : type === ExportType.LastReleasedData ? (
        <button
          className="govuk-button"
          onClick={actions.triggerReleasedResultsExport}
          disabled={isLoading || exportState.isLatestAllocationStateBlockedByJob || !isExportPermitted}
        >
          {jobsInfo.latestReleasedAllocationExportJob ? "Refresh " : "Create "} SQL data
        </button>
      ) : null}
    </section>
  );
};

function SuccessMessage({
  specification,
  exportJob,
  isLoadingLatestPublishedDate,
  latestPublishedDate,
}: {
  specification: SpecificationSummary;
  exportJob: JobDetails;
  isLoadingLatestPublishedDate: boolean;
  latestPublishedDate: Date | undefined;
}) {
  const history = useHistory();

  function handleContinueClick() {
    history.push("/");
  }

  return (
    <>
      <div className="govuk-grid-row ">
        <div className="govuk-grid-column-full">
          <div className="govuk-panel govuk-panel--confirmation ">
            <h1 className="govuk-panel__title">Export successful</h1>
          </div>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <dl className="govuk-summary-list govuk-summary-list--no-border">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Funding stream</dt>
              <dd className="govuk-summary-list__value">{specification?.fundingStreams[0]?.id}</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Funding period</dt>
              <dd className="govuk-summary-list__value">{specification?.fundingPeriod.id}</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Specification</dt>
              <dd className="govuk-summary-list__value">{specification?.name}</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Exported at</dt>
              <dd className="govuk-summary-list__value">
                {exportJob?.lastUpdated ? (
                  <DateTimeFormatter date={exportJob?.lastUpdated as Date} />
                ) : (
                  <span className="govuk-body">N/A</span>
                )}
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Last funding data change</dt>
              <dd className="govuk-summary-list__value">
                {isLoadingLatestPublishedDate ? (
                  <LoadingFieldStatus title="Loading..." />
                ) : !latestPublishedDate ? (
                  <span className="govuk-body">N/A</span>
                ) : (
                  <DateTimeFormatter date={latestPublishedDate} />
                )}
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
