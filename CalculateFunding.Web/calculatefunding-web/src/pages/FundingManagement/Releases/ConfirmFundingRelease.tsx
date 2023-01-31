import { useReleaseFundingSummaryData } from "hooks/FundingApproval/useReleaseFundingSummaryData";
import React, { useMemo, useState } from "react";
import { RouteComponentProps, useHistory } from "react-router";
import { Link } from "react-router-dom";
import { FundingConfiguration } from "../../../types/FundingConfiguration";
import { SpecificationSummary } from "../../../types/SpecificationSummary";

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
}

export function ConfirmFundingRelease({
  match,
}: RouteComponentProps<FundingManagementApprovalsConfirmFundingRouteProps>) {
  const { fundingStreamId, fundingPeriodId, specificationId } = match.params;
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const channelCodes = params.getAll("purposes");
  const isChannelCodeAvailable = channelCodes.includes("Statement" || "Payment" || "Contract")
  const actionType = FundingActionType.Release;
  const [acknowledge, setAcknowledge] = useState<boolean>(false);

  const { state: errors, clearErrorsFromContext, addErrorToContext } = useErrorContext();
  const {
    specification,
    isLoadingSpecification,
    fundingConfiguration,
    isLoadingFundingConfiguration,
    clearFundingSearchSelection,
    latestJob,
    isWaitingForJob,
    isPermissionsFetched,
    hasPermissionToRelease,
    hasPermissionToReleaseForStatement,
    hasPermissionToReleaseForContractorPayments,
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
  const { releaseSummaryData, isLoadingReleaseSummaryData } = useReleaseFundingSummaryData(
    specificationId,
    channelCodes,
    selectedProviderIds
  );
  
  const handleUploadButtonChange = (specification: SpecificationSummary) => {
    const fundingActionType = FundingActionType.Release;
    history.push(
      `/FundingManagement/${fundingActionType}/UploadBatch/${specification.fundingStreams[0].id}/${specification.fundingPeriod.id}/${specification.id}`
    );
  };

  let title = "Confirm funding release";
  let initialConfirmButtonState = isLoading || isWaitingForJob || !releaseSummaryData || !hasPermissionToRelease || (releaseSummaryData.totalProviders<=0); 
  let isConfirmButtonDisabled = initialConfirmButtonState;
  if((!hasPermissionToReleaseForStatement || !hasPermissionToReleaseForContractorPayments) && isChannelCodeAvailable)
  {
    title = title + (hasPermissionToReleaseForStatement ?  " for statements" : " for payments or contract");

    if(!initialConfirmButtonState) {
      isConfirmButtonDisabled = !acknowledge;
    }
  }
  const handleAcknowledge = async () => {    
    setAcknowledge(!acknowledge);
    if(!initialConfirmButtonState) {
      isConfirmButtonDisabled = !acknowledge;
    }
    else {
      isConfirmButtonDisabled = initialConfirmButtonState;
    }
  };

  const acknowledgeText = () => {
    if(hasPermissionToReleaseForStatement)
    {
      return "By selecting this checkbox,you confirm that you understand this release is for statements only."
    }
    else if(hasPermissionToReleaseForContractorPayments) {
      return "By selecting this checkbox,you confirm that you understand this release is for payments or contract only."
    }
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
        jobId = (
          await publishService.releaseProvidersService(specificationId, selectedProviderIds, channelCodes)
        ).data.jobId;
      } else {
        jobId = (await publishService.releaseService(specificationId, channelCodes)).data.jobId;
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
      <Breadcrumbs>
        <Breadcrumb name="Home" url="/" />
        <Breadcrumb name={"Funding management"} url={"/FundingManagement"} />
        <FundingSelectionBreadcrumb actionType={actionType} />
        <Breadcrumb
          url={`/FundingManagement/Release/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
          name={specification?.fundingStreams[0].name ?? ""}
        />
        <Breadcrumb name={"Confirm release"} />
      </Breadcrumbs>

      {!hasPermissionToRelease && (
        <PermissionStatus
          requiredPermissions={[Permission.CanReleaseFunding]}
          hidden={!isPermissionsFetched}
        />        
      )}

      {hasPermissionToRelease && !hasPermissionToReleaseForStatement && isChannelCodeAvailable &&  (
        <PermissionStatus
          requiredPermissions={[Permission.CanReleaseFundingForStatement]}
          hidden={!isPermissionsFetched}
        />
      )}

      {hasPermissionToRelease && !hasPermissionToReleaseForContractorPayments && isChannelCodeAvailable && (
          <PermissionStatus
            requiredPermissions={[Permission.CanReleaseFundingForPaymentOrContract]}
            hidden={!isPermissionsFetched}
          />
        )}
      
      <MultipleErrorSummary errors={errors} />

      <Title
        title={title}
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
            releaseSummary={releaseSummaryData}
            isLoadingSummaryData={isLoadingReleaseSummaryData}
          />

          {(!hasPermissionToReleaseForStatement || !hasPermissionToReleaseForContractorPayments) && isChannelCodeAvailable && (releaseSummaryData || !isLoadingReleaseSummaryData) &&(
            <div className="govuk-checkboxes govuk-!-margin-bottom-7 govuk-!-margin-top-1">
              <div className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  name="acknowledgementCheckbox"
                  id="acknowledgementCheckbox"
                  type="checkbox"            
                  checked={acknowledge}
                  onChange={handleAcknowledge}
                />
                <label className="govuk-label govuk-checkboxes__label" htmlFor="acknowledgementCheckbox">
                    {acknowledgeText()}
                </label>
              </div>
            </div>
          )}
        </section>
      )}

      <ButtonControlsSection
        isDisabled={isConfirmButtonDisabled}
        onConfirm={handleConfirm}
        onUploadButtonChange={handleUploadButtonChange}
        specificationId = {specificationId}
        fundingStreamId = {fundingStreamId}
        fundingPeriodId = {fundingPeriodId}
        isWaitingForJob = {isWaitingForJob}
        fundingConfiguration = {fundingConfiguration}
        specification = {specification}        
      />
    </Main>
  );
}

const ButtonControlsSection = ({
  isDisabled,
  onConfirm,
  onUploadButtonChange,
  specificationId,
  fundingStreamId,
  fundingPeriodId,
  isWaitingForJob,
  fundingConfiguration,
  specification
}: {
  isDisabled: boolean;
  onConfirm: () => void;
  onUploadButtonChange: (specification: SpecificationSummary) => void;
  specificationId: string;
  fundingStreamId: string;
  fundingPeriodId: string;
  isWaitingForJob: boolean;
  fundingConfiguration: FundingConfiguration | undefined;
  specification: SpecificationSummary | undefined;
}) => (
  <section aria-label="action controls">
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full govuk-button-group">
        <button
          data-prevent-double-click="true"
          className="govuk-button govuk-!-margin-right-1"
          data-module="govuk-button"
          disabled={isDisabled}
          onClick={onConfirm}
        >
          Confirm release
        </button>
        {fundingConfiguration && specification && fundingConfiguration.approvalMode === ApprovalMode.Batches && !isWaitingForJob && (
          <button 
          data-prevent-double-click="true"
          className="govuk-button govuk-button--secondary" 
          data-module="govuk-button"
          onClick={() => onUploadButtonChange(specification)}>
            Change selection
          </button> 
        )}
        <Link
          to={`/FundingManagement/Release/Results/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
          className="govuk-link govuk-link--no-visited-state"
        >
          Cancel
        </Link>       
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
