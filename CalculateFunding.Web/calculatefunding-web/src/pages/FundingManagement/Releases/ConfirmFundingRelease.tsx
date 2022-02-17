import React, { useMemo, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../../components/DateTimeFormatter";
import { FundingReleaseSummary } from "../../../components/Funding/Confirmation/FundingReleaseSummary";
import { FundingSelectionBreadcrumb } from "../../../components/Funding/FundingSelectionBreadcrumb";
import JobNotificationSection from "../../../components/Jobs/JobNotificationSection";
import { LoadingStatusNotifier } from "../../../components/LoadingStatusNotifier";
import { Main } from "../../../components/Main";
import { MultipleErrorSummary } from "../../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../../components/PermissionStatus";
import { Title } from "../../../components/Title";
import { useErrorContext } from "../../../context/ErrorContext";
import { useFundingConfirmation } from "../../../hooks/FundingApproval/useFundingConfirmation";
import { useAddJobObserver } from "../../../hooks/Jobs/useAddJobObserver";
import * as publishService from "../../../services/publishService";
import { ApprovalMode } from "../../../types/ApprovalMode";
import { JobDetails } from "../../../types/jobDetails";
import { Permission } from "../../../types/Permission";
import { FundingActionType } from "../../../types/PublishedProvider/PublishedProviderFundingCount";
import { Section } from "../../../types/Sections";

export interface FundingManagementApprovalsConfirmFundingRouteProps {
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
  mode: FundingActionType;
}

export function ConfirmFundingRelease({
  match,
}: RouteComponentProps<FundingManagementApprovalsConfirmFundingRouteProps>) {
  const history = useHistory();
  const { fundingStreamId, fundingPeriodId, specificationId } = match.params;
  const params = new URLSearchParams(history.location.search);
  const channelCodes = params.getAll("purposes");
  const actionType = FundingActionType.Release;

  const { state: errors, clearErrorsFromContext, addErrorToContext } = useErrorContext();
  const {
    specification,
    isLoadingSpecification,
    fundingConfiguration,
    isLoadingFundingConfiguration,
    fundingSummary,
    clearFundingSearchSelection,
    latestJob,
    isWaitingForJob,
    isPermissionsFetched,
    hasPermissionToRelease,
    selectedProviderIds,
    notifications,
    specificationLastUpdatedDate,
  } = useFundingConfirmation({
    specificationId: specificationId,
    fundingStreamId: fundingStreamId,
    fundingPeriodId: fundingPeriodId,
    actionType,
  });
  const { addJobObserver } = useAddJobObserver();
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const isLoading = useMemo(
    () =>
      isConfirming ||
      specification === undefined ||
      fundingConfiguration === undefined ||
      !isPermissionsFetched,
    [specification, fundingConfiguration, isConfirming, isPermissionsFetched]
  );

  const handleCancel = () => {
    history.push(
      `/FundingManagement/Release/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`
    );
  };

  const handleConfirm = async () => {
    clearErrorsFromContext();
    if (!fundingConfiguration) {
      return;
    }
    setIsConfirming(true);
    let jobId: string;
    try {
      if (fundingConfiguration.approvalMode === ApprovalMode.Batches && selectedProviderIds.length > 0) {
        jobId = (await publishService.releaseProvidersFundingService(specificationId, selectedProviderIds))
          .data.jobId;
      } else {
        jobId = (await publishService.releaseSpecificationFundingService(specificationId)).data.jobId;
      }
      clearFundingSearchSelection();
      addJobObserver({ jobId: jobId, specificationId: specificationId });

      history.push(
        `/FundingManagement/Release/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`
      );
    } catch (e: any) {
      addErrorToContext({
        error: e,
        description: "Error while trying to release specification",
      });
      setIsConfirming(false);
    }
  };

  return (
    <Main location={Section.FundingManagement}>
      <MultipleErrorSummary errors={errors} />

      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"Funding management"} url={"/FundingManagement"} />
        <FundingSelectionBreadcrumb actionType={actionType} />
        <Breadcrumb
          url={`/FundingManagement/Release/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
          name={specification?.fundingStreams[0].name ?? ""}
        />
        <Breadcrumb name={"Confirm release"} />
      </Breadcrumbs>

      <PermissionStatus
        requiredPermissions={hasPermissionToRelease ? [] : [Permission.CanReleaseFunding]}
        hidden={!isPermissionsFetched}
      />

      <Title
        title="Confirm funding release"
        titleCaption="Check the information below carefully before releasing the funding"
      />

      {notifications.length > 0 && (
        <JobNotificationSection
          jobNotifications={notifications}
          notificationSettings={[
            {
              jobTypes: [], // any we have subscribed to
              showActive: true,
              showFailed: true,
              showSuccessful: false,
            },
          ]}
        />
      )}

      <LoadingStatusNotifier
        notifications={[
          {
            isActive: isLoadingSpecification,
            title: "Loading specification",
          },
          {
            isActive: isLoadingFundingConfiguration,
            title: "Loading funding configuration",
          },
          {
            isActive: !isPermissionsFetched,
            title: "Loading permissions",
          },
        ]}
      />

      <LastUpdateInfoSection
        latestJob={latestJob}
        specificationLastUpdatedDate={specificationLastUpdatedDate}
      />

      <WarningSection />

      {fundingConfiguration && specification && (
        <section>
          <FundingReleaseSummary
            approvalMode={fundingConfiguration.approvalMode}
            specification={specification}
            channelCodes={channelCodes}
            fundingSummary={fundingSummary}
            isWaitingForJob={isWaitingForJob}
          />
        </section>
      )}

      <ButtonControlsSection
        isDisabled={isLoading || isWaitingForJob || !fundingSummary || !hasPermissionToRelease}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Main>
  );
}

const ButtonControlsSection = ({
  isDisabled,
  onConfirm,
  onCancel,
}: {
  isDisabled: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <section aria-label="action controls">
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <button
          data-prevent-double-click="true"
          className="govuk-button govuk-!-margin-right-1"
          data-module="govuk-button"
          disabled={isDisabled}
          onClick={onConfirm}
        >
          Confirm release
        </button>
        <a className="govuk-button govuk-button--secondary" data-module="govuk-button" onClick={onCancel}>
          Cancel
        </a>
      </div>
    </div>
  </section>
);

const LastUpdateInfoSection = ({
  specificationLastUpdatedDate,
  latestJob,
}: {
  specificationLastUpdatedDate: Date | undefined;
  latestJob: JobDetails | undefined;
}) => (
  <div className="govuk-grid-row govuk-!-margin-bottom-4">
    <div className="govuk-grid-column-three-quarters">
      <dl className="govuk-summary-list govuk-summary-list--no-border">
        {!!specificationLastUpdatedDate &&
          !!latestJob?.lastUpdated &&
          latestJob.lastUpdated < specificationLastUpdatedDate && (
            <div className="govuk-summary-list__row govuk-!-width-one-third">
              <dt
                id="last-refresh-label"
                aria-label="Last refresh"
                className="govuk-summary-list__key govuk-!-width-one-third"
              >
                Last refresh
              </dt>
              <dd
                aria-labelledby="last-refresh-label"
                className="govuk-summary-list__value govuk-!-padding-left-2"
              >
                {latestJob?.lastUpdated && (
                  <>
                    <DateTimeFormatter date={latestJob.lastUpdated} /> by {latestJob.invokerUserDisplayName}
                  </>
                )}
              </dd>
            </div>
          )}
        {!!specificationLastUpdatedDate &&
          !!latestJob?.lastUpdated &&
          latestJob.lastUpdated < specificationLastUpdatedDate && (
            <div className="govuk-summary-list__row govuk-!-width-one-third">
              <dt
                id="last-calc-results-label"
                aria-label="Last calculation results update"
                className="govuk-summary-list__key govuk-!-width-one-third"
              >
                Last calculation results update
              </dt>
              <dd
                aria-labelledby="last-calc-results-label"
                className="govuk-summary-list__value govuk-!-padding-left-2"
              >
                <DateTimeFormatter date={specificationLastUpdatedDate} />
              </dd>
            </div>
          )}
      </dl>
    </div>
  </div>
);

const WarningSection = () => (
  <div className="govuk-grid-row govuk-!-margin-bottom-3">
    <div className="govuk-grid-column-three-quarters">
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon" aria-hidden="true">
          !
        </span>
        <strong className="govuk-warning-text__text">
          <span className="govuk-warning-text__assistive">Warning</span>
          Released funding values can change when data or calculations are altered. If the funding values
          change, their status will become ‘updated’ and they will need to be released again.
        </strong>
      </div>
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon" aria-hidden="true">
          !
        </span>
        <strong className="govuk-warning-text__text">
          <span className="govuk-warning-text__assistive">Warning</span>
          Indicative values will not be released for payment or contract.
        </strong>
      </div>
    </div>
  </div>
);
