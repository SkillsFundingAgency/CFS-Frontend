import React from "react";
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
import { useExportToSqlJobs } from "../../../hooks/ExportToSql/useExportToSqlJobs";
import { useSpecificationPermissions } from "../../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../../hooks/useErrors";
import { useSpecificationSummary } from "../../../hooks/useSpecificationSummary";
import { JobDetails } from "../../../types/jobDetails";
import { Permission } from "../../../types/Permission";
import { Section } from "../../../types/Sections";
import { SpecificationSummary } from "../../../types/SpecificationSummary";

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

  const {
    lastExportAllocationDataJob,
    lastCalcResultsExportJob,
    lastReleasedAllocationJob,
    hasRunningFundingJobs,
    isExportBlockedByJob,
    isCurrentAllocationStateBlockedByJob,
    isLatestAllocationStateBlockedByJob,
    isLatestCalcResultsAlreadyExported,
    isLatestAllocationDataAlreadyExported,
    isLatestReleaseDataAlreadyExported,
    isAnotherUserRunningSqlJob,
    latestPublishedDate,
    isLoadingLatestPublishedDate,
    isExporting,
    exportJob,
    fundingJobStatusMessage,
    exportJobStatusMessage,
    triggerCalcResultsExport,
    triggerCurrentAllocationResultsExport,
    triggerReleasedResultsExport,
  } = useExportToSqlJobs({ specificationId, fundingStreamId, fundingPeriodId, addError, clearErrorMessages });

  const { isCheckingForPermissions, isPermissionsFetched, hasMissingPermissions, missingPermissions } =
    useSpecificationPermissions(specificationId, [Permission.CanRefreshPublishedQa]);

  const isExportPermitted = !isCheckingForPermissions && !hasMissingPermissions;
  const isLoading = isLoadingSpecification || isLoadingLatestPublishedDate;

  return (
    <Main location={Section.Datasets}>
      <Breadcrumbs>
        <Breadcrumb name="Calculate funding" url="/" />
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
      ) : isExporting ? (
        <LoadingStatus
          title={exportJobStatusMessage}
          subTitle="Please wait, this could take several minutes"
          description="Please do not refresh the page, you will be redirected automatically"
        />
      ) : exportJob?.isSuccessful ? (
        <SuccessMessage
          exportJob={exportJob}
          isLoadingLatestPublishedDate={isLoadingLatestPublishedDate}
          latestPublishedDate={latestPublishedDate?.value ?? undefined}
          specification={specification as SpecificationSummary}
        />
      ) : (
        (!exportJob || exportJob?.isFailed) && (
          <>
            <ExportSection
              title="Latest calculation results"
              description="Includes funding line, template calculation and additional calculation values for providers from
              the latest specification calculation run."
              exportStatusMessage={exportJobStatusMessage}
              fundingStatusMessage={fundingJobStatusMessage}
              hasRunningFundingJobs={hasRunningFundingJobs}
              showAdditionalDetails={true}
              isAnotherUserRunningExportJob={isAnotherUserRunningSqlJob}
              lastExportJob={lastCalcResultsExportJob}
              lastPublishDate={latestPublishedDate?.value ?? undefined}
            >
              {isLatestCalcResultsAlreadyExported ? (
                <div className="govuk-inset-text">SQL data up to date</div>
              ) : (
                <button
                  className="govuk-button"
                  onClick={triggerCalcResultsExport}
                  disabled={isLoading || isExportBlockedByJob || !isExportPermitted}
                >
                  {lastCalcResultsExportJob ? "Refresh " : "Create "} SQL data
                </button>
              )}
            </ExportSection>

            <ExportSection
              title="Current state allocation results"
              description="Includes funding line, template calculation and profile values for draft, approved, updated and released provider allocations."
              exportStatusMessage={exportJobStatusMessage}
              fundingStatusMessage={fundingJobStatusMessage}
              hasRunningFundingJobs={hasRunningFundingJobs}
              isAnotherUserRunningExportJob={isAnotherUserRunningSqlJob}
              showAdditionalDetails={specification?.isSelectedForFunding}
              lastExportJob={lastExportAllocationDataJob}
              lastPublishDate={latestPublishedDate?.value ?? undefined}
            >
              {specification?.isSelectedForFunding === false ? (
                <div className="govuk-inset-text">
                  This specification has not been chosen for funding therefore you are unable to create the
                  SQL data.
                </div>
              ) : isLatestAllocationDataAlreadyExported ? (
                <div className="govuk-inset-text">SQL data up to date</div>
              ) : (
                <button
                  className="govuk-button"
                  onClick={triggerCurrentAllocationResultsExport}
                  disabled={isLoading || isCurrentAllocationStateBlockedByJob || !isExportPermitted}
                >
                  {lastExportAllocationDataJob ? "Refresh " : "Create "} SQL data
                </button>
              )}
            </ExportSection>

            <ExportSection
              title="Latest released state allocation results"
              description="Includes the funding line, template calculation and profile values for the latest released version of the provider allocations."
              exportStatusMessage={exportJobStatusMessage}
              fundingStatusMessage={fundingJobStatusMessage}
              hasRunningFundingJobs={hasRunningFundingJobs}
              isAnotherUserRunningExportJob={isAnotherUserRunningSqlJob}
              showAdditionalDetails={specification?.isSelectedForFunding}
              lastExportJob={lastReleasedAllocationJob}
              lastPublishDate={latestPublishedDate?.value ?? undefined}
            >
              {specification?.isSelectedForFunding === false ? (
                <div className="govuk-inset-text">
                  This specification has not been chosen for funding therefore you are unable to create the
                  SQL data.
                </div>
              ) : isLatestReleaseDataAlreadyExported ? (
                <div className="govuk-inset-text">SQL data up to date</div>
              ) : (
                <button
                  className="govuk-button"
                  onClick={triggerReleasedResultsExport}
                  disabled={isLoading || isLatestAllocationStateBlockedByJob || !isExportPermitted}
                >
                  {lastReleasedAllocationJob ? "Refresh " : "Create "} SQL data
                </button>
              )}
            </ExportSection>
          </>
        )
      )}
    </Main>
  );
}

const ExportSection = ({
  title,
  description,
  lastPublishDate,
  lastExportJob,
  isAnotherUserRunningExportJob,
  showAdditionalDetails,
  exportStatusMessage,
  fundingStatusMessage,
  hasRunningFundingJobs,
  children,
}: {
  title: string;
  description: string;
  lastPublishDate: Date | undefined;
  lastExportJob: JobDetails | undefined;
  exportStatusMessage: string;
  fundingStatusMessage: string;
  isAnotherUserRunningExportJob: boolean;
  showAdditionalDetails: boolean;
  hasRunningFundingJobs: boolean;
  children: any;
}) => {
  const titleId = `${convertToSlug(title)}-title`;
  return (
    <section className="govuk-main-wrapper" aria-describedby={titleId}>
      <h2 id={titleId} className="govuk-heading-l">
        {title}
      </h2>
      <p className="govuk-body">{description}</p>
      {showAdditionalDetails && (
        <details
          hidden={!showAdditionalDetails}
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
                    <LoadingFieldStatus title={exportStatusMessage} />
                  ) : !lastExportJob?.lastUpdated ? (
                    <span className="govuk-body">N/A</span>
                  ) : hasRunningFundingJobs ? (
                    <LoadingFieldStatus
                      title={`Funding release in progress. Please wait. ${fundingStatusMessage}`}
                    />
                  ) : isAnotherUserRunningExportJob ? (
                    <LoadingFieldStatus
                      title={`Calculation run in progress. Please wait. ${exportStatusMessage}`}
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
                <dt className="govuk-summary-list__key">Last funding data change</dt>
                <dd className="govuk-summary-list__value">
                  {hasRunningFundingJobs ? (
                    <LoadingFieldStatus title={fundingStatusMessage} />
                  ) : !lastPublishDate ? (
                    <span className="govuk-body">N/A</span>
                  ) : (
                    <DateTimeFormatter date={lastPublishDate} />
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </details>
      )}
      {children}
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
