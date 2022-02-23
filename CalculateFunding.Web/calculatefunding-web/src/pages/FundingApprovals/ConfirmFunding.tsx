import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router";

import { initialiseFundingSearchSelection } from "../../actions/FundingSearchSelectionActions";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { DateTimeFormatter } from "../../components/DateTimeFormatter";
import { FundingConfirmationSummary } from "../../components/Funding/FundingConfirmationSummary";
import JobNotificationSection from "../../components/Jobs/JobNotificationSection";
import { LoadingStatusNotifier } from "../../components/LoadingStatusNotifier";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { PermissionStatus } from "../../components/PermissionStatus";
import { getLatestJob } from "../../helpers/jobDetailsHelper";
import { useAddJobObserver } from "../../hooks/Jobs/useAddJobObserver";
import { useJobSubscription } from "../../hooks/Jobs/useJobSubscription";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../hooks/useErrors";
import { useFundingConfiguration } from "../../hooks/useFundingConfiguration";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import { IStoreState } from "../../reducers/rootReducer";
import { getSpecificationCalculationResultsMetadata } from "../../services/providerService";
import { publishedProviderService } from "../../services/publishedProviderService";
import * as publishService from "../../services/publishService";
import { FundingSearchSelectionState } from "../../states/FundingSearchSelectionState";
import { ApprovalMode } from "../../types/ApprovalMode";
import { MonitorFallback, MonitorMode } from "../../types/Jobs/JobSubscriptionModels";
import { JobType } from "../../types/jobType";
import { Permission } from "../../types/Permission";
import {
  FundingActionType,
  PublishedProviderFundingCount,
} from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { buildInitialPublishedProviderSearchRequest } from "../../types/publishedProviderSearchRequest";
import { Section } from "../../types/Sections";

export interface ConfirmFundingRouteProps {
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
  mode: Exclude<FundingActionType, FundingActionType.Refresh>;
}

export function ConfirmFunding({ match }: RouteComponentProps<ConfirmFundingRouteProps>) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { specificationId, fundingStreamId, fundingPeriodId, mode: actionType } = match.params;

  const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(
    (state) => state.fundingSearchSelection
  );
  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({ error: err, description: "Error while loading specification" })
  );
  const { missingPermissions, hasPermission, isPermissionsFetched } = useSpecificationPermissions(
    specificationId,
    [Permission.CanApproveFunding, Permission.CanReleaseFunding]
  );
  const { fundingConfiguration, isLoadingFundingConfiguration } = useFundingConfiguration(
    fundingStreamId,
    fundingPeriodId,
    (err) => addError({ error: err, description: "Error while loading funding configuration" })
  );

  const { addJobObserver } = useAddJobObserver();

  const {
    addSub,
    removeAllSubs,
    results: notifications,
  } = useJobSubscription({
    onError: (err) =>
      addError({ error: err, description: "An error occurred while monitoring the running jobs" }),
  });

  const { errors, addError, clearErrorMessages } = useErrors();
  const [fundingSummary, setFundingSummary] = useState<PublishedProviderFundingCount>();
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
  const hasPermissionToApprove = useMemo(
    () => hasPermission && hasPermission(Permission.CanApproveFunding),
    [isPermissionsFetched]
  );
  const hasPermissionToRelease = useMemo(
    () => hasPermission && hasPermission(Permission.CanReleaseFunding),
    [isPermissionsFetched]
  );
  const [specificationLastUpdatedDate, setSpecificationLastUpdatedDate] = useState<Date>();
  useEffect(() => {
    getSpecificationCalculationResultsMetadata(specificationId)
      .then((result) => {
        setSpecificationLastUpdatedDate(result.data.lastUpdated);
      })
      .catch((err) => {
        addError({
          error: err,
          description: `Error while getting specification calculation results metadata for specification Id: ${specificationId}`,
        });
      });

    addSub({
      monitorMode: MonitorMode.SignalR,
      monitorFallback: MonitorFallback.Polling,
      filterBy: {
        specificationId: specificationId,
        jobTypes: [
          JobType.RefreshFundingJob,
          JobType.ApproveAllProviderFundingJob,
          JobType.ApproveBatchProviderFundingJob,
          JobType.PublishBatchProviderFundingJob,
          JobType.PublishAllProviderFundingJob,
        ],
      },
      onError: (e) => addError({ error: e, description: "Error while checking for background job" }),
    });
    return () => {
      removeAllSubs();
    };
  }, [specificationId]);

  const latestJob = getLatestJob(notifications.flatMap((n) => n.latestJob));
  const isWaitingForJob = notifications.some((n) => !!n.latestJob?.isActive);

  useEffect(() => {
    if (!fundingConfiguration || fundingSummary) return;

    async function loadBatchFundingSummary() {
      const response =
        actionType === FundingActionType.Approve
          ? await publishService.getFundingSummaryForApprovingService(
              specificationId,
              state.selectedProviderIds
            )
          : await publishService.getFundingSummaryForReleasingService(
              specificationId,
              state.selectedProviderIds
            );
      setFundingSummary(response.data);
    }

    async function loadFullFundingSummary() {
      const search = buildInitialPublishedProviderSearchRequest(
        fundingStreamId,
        fundingPeriodId,
        specificationId
      );
      const publishedProviderSearchResults = (
        await publishedProviderService.searchForPublishedProviderResults(search)
      ).data;
      const funding: PublishedProviderFundingCount = {
        count:
          actionType === FundingActionType.Approve
            ? publishedProviderSearchResults.totalProvidersToApprove
            : publishedProviderSearchResults.totalProvidersToPublish,
        indicativeProviderCount: 0,
        paidProviderCount: 0,
        fundingStreamsFundings: [],
        localAuthorities: [],
        localAuthoritiesCount: 0,
        providerTypes: [],
        providerTypesCount: 0,
        totalFunding: publishedProviderSearchResults.totalFundingAmount,
        indicativeProviderTotalFunding: null,
        paidProvidersTotalFunding: null,
      };
      setFundingSummary(funding);
    }

    if (fundingConfiguration.approvalMode === ApprovalMode.All) {
      loadFullFundingSummary();
    }
    if (fundingConfiguration.approvalMode === ApprovalMode.Batches) {
      if (state.selectedProviderIds.length > 0) {
        loadBatchFundingSummary();
      }
      if (state.selectedProviderIds.length === 0) {
        addError({ error: "There are no selected providers to " + actionType.toLowerCase() });
      }
    }
  }, [fundingConfiguration, match.params]);

  const clearFundingSearchSelection = useCallback(() => {
    dispatch(initialiseFundingSearchSelection(fundingStreamId, fundingPeriodId, specificationId));
  }, [match.params]);

  const handleAcknowledge = async () => {
    setAcknowledge(!acknowledge);
  };

  const handleConfirm = async () => {
    clearErrorMessages();
    if (!acknowledge) {
      addError({
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
      const specId = specificationId;
      let jobId = "";
      if (fundingConfiguration.approvalMode === ApprovalMode.Batches) {
        if (actionType === FundingActionType.Approve) {
          jobId = (await publishService.approveProvidersFundingService(specId, state.selectedProviderIds))
            .data.jobId;
        } else if (actionType === FundingActionType.Release) {
          jobId = (await publishService.releaseProvidersFundingService(specId, state.selectedProviderIds))
            .data.jobId;
        }
      } else {
        if (actionType === FundingActionType.Approve) {
          jobId = (await publishService.approveSpecificationFundingService(specId)).data.jobId;
        } else if (actionType === FundingActionType.Release) {
          jobId = (await publishService.releaseSpecificationFundingService(specId)).data.jobId;
        }
      }
      clearFundingSearchSelection();
      addJobObserver({ jobId: jobId, specificationId: specId });
      history.push(
        `/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`
      );
    } catch (e: any) {
      addError({
        error: e,
        description: `Error while trying to ${actionType.toLowerCase()} specification`,
      });
      setIsConfirming(false);
    }
  };

  return (
    <Main location={Section.FundingManagement}>
      <MultipleErrorSummary errors={errors} />

      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"Approvals"} />
        <Breadcrumb name={"Select specification"} url={"/Approvals/Select"} />
        <Breadcrumb
          name="Funding approval results"
          url={`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
        />
        <Breadcrumb name={actionType + " funding"} />
      </Breadcrumbs>

      <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched} />

      <div>
        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
          Confirm funding {actionType === FundingActionType.Approve ? "approval" : "release"}
        </h1>
        <span className="govuk-caption-xl govuk-!-margin-bottom-8">
          Check the information below carefully before{" "}
          {actionType === FundingActionType.Approve ? "approving" : "releasing"} the funding
        </span>
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
        <section data-testid="funding-summary-section">
          <FundingConfirmationSummary
            routingParams={match.params}
            approvalMode={fundingConfiguration.approvalMode}
            specification={specification}
            fundingSummary={fundingSummary}
            canApproveFunding={hasPermissionToApprove}
            canReleaseFunding={hasPermissionToRelease}
            addError={addError}
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
                  Released funding values can change when data or calculations are altered. If the funding
                  values change, their status will become ‘updated’ and they will need to be released again.
                </li>
                <li>
                  Selected providers may not appear in the provider count due to; provider record missing from
                  funding data, providers currently in error state or providers already set as approved or
                  released
                </li>
              </ul>
              <div className="govuk-checkboxes">
                <div className="govuk-checkboxes__item">
                  <input
                    className="govuk-checkboxes__input"
                    name="acknowledgementCheckbox"
                    type="checkbox"
                    data-testid="acknowledgementCheckbox"
                    disabled={isConfirming}
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

          <button
            data-prevent-double-click="true"
            className="govuk-button govuk-!-margin-right-1"
            data-module="govuk-button"
            disabled={isLoading || isWaitingForJob || !fundingSummary}
            onClick={handleConfirm}
          >
            Confirm {actionType === FundingActionType.Approve ? "approval" : "release"}
          </button>
          <a
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
            onClick={() => history.goBack()}
          >
            Cancel
          </a>
        </div>
      </div>
    </Main>
  );
}
