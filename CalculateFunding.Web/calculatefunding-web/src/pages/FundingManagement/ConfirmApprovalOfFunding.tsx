import React, { useMemo, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";

import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { FundingApprovalSummary } from "../../components/Funding/Approvals/FundingApprovalSummary";
import { FundingSelectionBreadcrumb } from "../../components/Funding/FundingSelectionBreadcrumb";
import JobNotificationSection from "../../components/Jobs/JobNotificationSection";
import { LoadingStatusNotifier } from "../../components/LoadingStatusNotifier";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { useErrorContext } from "../../context/ErrorContext";
import { useFundingConfirmation } from "../../hooks/FundingApproval/useFundingConfirmation";
import * as publishService from "../../services/publishService";
import { ApprovalMode } from "../../types/ApprovalMode";
import { Permission } from "../../types/Permission";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { Section } from "../../types/Sections";

export interface FundingManagementApprovalsConfirmFundingRouteProps {
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
  mode: FundingActionType;
}

export function ConfirmApprovalOfFunding({
  match,
}: RouteComponentProps<FundingManagementApprovalsConfirmFundingRouteProps>) {
  const { fundingStreamId, fundingPeriodId, specificationId, mode } = match.params;
  const history = useHistory();
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
    hasPermissionToApprove,
    selectedProviderIds,
    notifications,
    specificationLastUpdatedDate,
  } = useFundingConfirmation({
    specificationId: specificationId,
    fundingStreamId: fundingStreamId,
    fundingPeriodId: fundingPeriodId,
    actionType: mode,
  });
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [acknowledge, setAcknowledge] = useState<boolean>(false);
  const isLoading = useMemo(
    () =>
      isConfirming ||
      specification === undefined ||
      fundingConfiguration === undefined ||
      !isPermissionsFetched,
    [specification, fundingConfiguration, isConfirming, isPermissionsFetched]
  );

  const handleAcknowledge = async () => {
    setAcknowledge(!acknowledge);
  };

  const handleConfirm = async () => {
    clearErrorsFromContext();
    if (!acknowledge) {
      addErrorToContext({
        fieldName: "acknowledge",
        error: "You must acknowledge that you understand the provider amount shown might not be up to date",
      });
      return;
    }
    if (!fundingConfiguration) {
      return;
    }
    setIsConfirming(true);
    try {
      if (fundingConfiguration.approvalMode === ApprovalMode.Batches) {
        await publishService.approveProvidersFundingService(specificationId, selectedProviderIds);
      } else {
        await publishService.approveSpecificationFundingService(specificationId);
      }
      clearFundingSearchSelection();
      history.push(
        `/FundingManagement/Approve/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`
      );
    } catch (e: any) {
      addErrorToContext({
        error: e,
        description: "Error while trying to approve specification",
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
        <FundingSelectionBreadcrumb actionType={FundingActionType.Approve} />
        <Breadcrumb
          url={`/FundingManagement/Approve/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
          name={specification?.fundingStreams[0].name ?? ""}
        />
        <Breadcrumb name={"Confirm approval"} />
      </Breadcrumbs>

      <PermissionStatus
        requiredPermissions={hasPermissionToApprove ? [] : [Permission.CanApproveFunding]}
        hidden={!isPermissionsFetched}
      />

      <div>
        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Confirm funding approval</h1>
        <h2 className="govuk-caption-xl govuk-!-margin-bottom-8">
          Check the information below carefully before approving the funding
        </h2>
      </div>

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

      {fundingConfiguration && specification && (
        <section>
          <FundingApprovalSummary
            approvalMode={fundingConfiguration.approvalMode}
            specification={specification}
            fundingSummary={fundingSummary}
            isWaitingForJob={isWaitingForJob}
          />
        </section>
      )}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div
            className={`govuk-form-group ${
              errors.filter((e) => e.fieldName === "acknowledge").length ? "govuk-form-group--error" : ""
            }`}
          >
            <fieldset className="govuk-fieldset" aria-describedby="acknowledgementCheckbox">
              <legend className="govuk-fieldset__legend">
                <div className="govuk-warning-text">
                  <span className="govuk-warning-text__icon" aria-hidden="true">
                    !
                  </span>
                  <strong className="govuk-warning-text__text">
                    <span className="govuk-warning-text__assistive">Warning</span>
                    The provider amount shown might not be up to date
                  </strong>
                </div>
              </legend>
              <ul className="govuk-list govuk-list--bullet">
                {!!specificationLastUpdatedDate &&
                  !!latestJob?.lastUpdated &&
                  latestJob.lastUpdated < specificationLastUpdatedDate && (
                    <li data-testid="last-refresh">
                      Providers were last refreshed <DateTimeFormatter date={latestJob.lastUpdated} /> by{" "}
                      {latestJob.invokerUserDisplayName}
                    </li>
                  )}
                {!!specificationLastUpdatedDate &&
                  !!latestJob?.lastUpdated &&
                  latestJob.lastUpdated < specificationLastUpdatedDate && (
                    <li data-testid="last-calculation-results">
                      Total provider amount was last calculated{" "}
                      <DateTimeFormatter date={specificationLastUpdatedDate} />
                    </li>
                  )}
                <li>
                  Selected providers may not appear in the provider count due to provider records missing from
                  funding data, providers currently in error state, or providers already set as approved or
                  released
                </li>
              </ul>
              <div className="govuk-checkboxes">
                <div className="govuk-checkboxes__item">
                  <input
                    className="govuk-checkboxes__input"
                    name="acknowledgementCheckbox"
                    type="checkbox"
                    checked={acknowledge}
                    onChange={handleAcknowledge}
                  />
                  <label className="govuk-label govuk-checkboxes__label" htmlFor="acknowledgementCheckbox">
                    I acknowledge that the total provider amount shown may not be up to date
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          <ButtonControlsSection
            isDisabled={isLoading || isWaitingForJob || !fundingSummary || !hasPermissionToApprove}
            onConfirm={handleConfirm}
            onCancel={() => history.goBack()}
          />
        </div>
      </div>
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
    <button
      data-prevent-double-click="true"
      className="govuk-button govuk-!-margin-right-1"
      data-module="govuk-button"
      disabled={isDisabled}
      onClick={onConfirm}
    >
      Confirm approval
    </button>
    <a className="govuk-button govuk-button--secondary" data-module="govuk-button" onClick={onCancel}>
      Cancel
    </a>
  </section>
);
