import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router";
import { Link } from "react-router-dom";

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
import { useJobSubscription } from "../../hooks/Jobs/useJobSubscription";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { useErrors } from "../../hooks/useErrors";
import { useFundingConfiguration } from "../../hooks/useFundingConfiguration";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import { IStoreState } from "../../reducers/rootReducer";
import { getSpecificationCalculationResultsMetadata } from "../../services/providerService";
import * as publishedProviderService from "../../services/publishedProviderService";
import * as publishService from "../../services/publishService";
import { FundingSearchSelectionState } from "../../states/FundingSearchSelectionState";
import { ApprovalMode } from "../../types/ApprovalMode";
import { HistoryPage } from "../../types/HistoryPage";
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
  mode: FundingActionType;
}

export function ConfirmFunding({ match }: RouteComponentProps<ConfirmFundingRouteProps>) {
  const history = useHistory();
  const dispatch = useDispatch();

  const previousPage: HistoryPage =
    history?.location?.state &&
    (history.location.state as any) &&
    ((history.location.state as any).previousPage as HistoryPage)
      ? (history.location.state as any).previousPage
      : {
          title: "Funding approval results",
          path: `/Approvals/SpecificationFundingApproval/${match.params.fundingStreamId}/${match.params.fundingPeriodId}/${match.params.specificationId}`,
        };
  const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(
    (state) => state.fundingSearchSelection
  );
  const { specification, isLoadingSpecification } = useSpecificationSummary(
    match.params.specificationId,
    (err) => addError({ error: err, description: "Error while loading specification" })
  );
  const { missingPermissions, hasPermission, isPermissionsFetched } = useSpecificationPermissions(
    match.params.specificationId,
    [Permission.CanApproveFunding, Permission.CanReleaseFunding]
  );
  const { fundingConfiguration, isLoadingFundingConfiguration } = useFundingConfiguration(
    match.params.fundingStreamId,
    match.params.fundingPeriodId,
    (err) => addError({ error: err, description: "Error while loading funding configuration" })
  );

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
  const [jobId, setJobId] = useState<string>("");
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
    getSpecificationCalculationResultsMetadata(match.params.specificationId)
      .then((result) => {
        setSpecificationLastUpdatedDate(result.data.lastUpdated);
      })
      .catch((err) => {
        addError({
          error: err,
          description: `Error while getting specification calculation results metadata for specification Id: ${match.params.specificationId}`,
        });
      });

    addSub({
      monitorMode: MonitorMode.SignalR,
      monitorFallback: MonitorFallback.Polling,
      filterBy: {
        specificationId: match.params.specificationId,
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
  }, [match.params.specificationId]);

  const latestJob = getLatestJob(notifications.flatMap((n) => n.latestJob));
  const isWaitingForJob = notifications.some((n) => !!n.latestJob?.isActive);
  useEffect(() => {
    if (!fundingConfiguration || fundingSummary) return;

    async function loadBatchFundingSummary() {
      const response =
        match.params.mode === FundingActionType.Approve
          ? await publishService.getFundingSummaryForApprovingService(
              match.params.specificationId,
              state.selectedProviderIds
            )
          : await publishService.getFundingSummaryForReleasingService(
              match.params.specificationId,
              state.selectedProviderIds
            );
      setFundingSummary(response.data);
    }

    async function loadFullFundingSummary() {
      const search = buildInitialPublishedProviderSearchRequest(
        match.params.fundingStreamId,
        match.params.fundingPeriodId,
        match.params.specificationId
      );
      const publishedProviderSearchResults = (
        await publishedProviderService.searchForPublishedProviderResults(search)
      ).data;
      const funding: PublishedProviderFundingCount = {
        count:
          match.params.mode === FundingActionType.Approve
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
        addError({ error: "There are no selected providers to " + match.params.mode.toLowerCase() });
      }
    }
  }, [fundingConfiguration, match.params]);

  useEffect(() => {
    const handleActionJobComplete = () => {
      if (jobId?.length && latestJob?.jobId === jobId) {
        if (isConfirming) {
          setIsConfirming(false);
        }
        if (latestJob.isSuccessful) {
          clearFundingSearchSelection();
          history.push(
            `/Approvals/SpecificationFundingApproval/${match.params.fundingStreamId}/${match.params.fundingPeriodId}/${match.params.specificationId}`
          );
        }
      }
    };

    handleActionJobComplete();
  }, [getLatestJob, jobId]);

  const clearFundingSearchSelection = useCallback(() => {
    dispatch(
      initialiseFundingSearchSelection(
        match.params.fundingStreamId,
        match.params.fundingPeriodId,
        match.params.specificationId
      )
    );
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
      const specId = match.params.specificationId;
      if (fundingConfiguration.approvalMode === ApprovalMode.Batches) {
        if (match.params.mode === FundingActionType.Approve) {
          setJobId(
            (await publishService.approveProvidersFundingService(specId, state.selectedProviderIds)).data
              .jobId
          );
        } else if (match.params.mode === FundingActionType.Release) {
          setJobId(
            (await publishService.releaseProvidersFundingService(specId, state.selectedProviderIds)).data
              .jobId
          );
        }
      } else {
        if (match.params.mode === FundingActionType.Approve) {
          setJobId((await publishService.approveSpecificationFundingService(specId)).data.jobId);
        } else if (match.params.mode === FundingActionType.Release) {
          setJobId((await publishService.releaseSpecificationFundingService(specId)).data.jobId);
        }
      }
    } catch (e: any) {
      addError({
        error: e,
        description: `Error while trying to ${match.params.mode.toLowerCase()} specification`,
      });
      setIsConfirming(false);
    }
  };

  const actionIsComplete = jobId && jobId.length > 0 && latestJob && latestJob.isComplete;

  return (
    <Main location={Section.FundingManagement}>
      <MultipleErrorSummary errors={errors} />

      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"Approvals"} />
        <Breadcrumb name={"Select specification"} url={"/Approvals/Select"} />
        <Breadcrumb
          name="Funding approval results"
          url={`/Approvals/SpecificationFundingApproval/${match.params.fundingStreamId}/${match.params.fundingPeriodId}/${match.params.specificationId}`}
        />
        <Breadcrumb name={match.params.mode + " funding"} />
      </Breadcrumbs>

      <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched} />

      <div>
        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
          Confirm funding {match.params.mode === FundingActionType.Approve ? "approval" : "release"}
        </h1>
        <span className="govuk-caption-xl govuk-!-margin-bottom-8">
          Check the information below carefully before{" "}
          {match.params.mode === FundingActionType.Approve ? "approving" : "releasing"} the funding
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
            id: "confirming",
            isActive: isConfirming,
            title: "Confirming...",
            subTitle: "Waiting for job to run",
          },
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

      {actionIsComplete ? (
        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-full">
            <Link
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
              to={previousPage.path}
            >
              Back
            </Link>
          </div>
        </div>
      ) : (
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
                    Selected providers may not appear in the provider count due to; provider record missing
                    from funding data, providers currently in error state or providers already set as approved
                    or released
                  </li>
                </ul>
                <div className="govuk-checkboxes">
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      name="acknowledgementCheckbox"
                      type="checkbox"
                      data-testid="acknowledgementCheckbox"
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
              Confirm {match.params.mode === FundingActionType.Approve ? "approval" : "release"}
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
      )}
    </Main>
  );
}
