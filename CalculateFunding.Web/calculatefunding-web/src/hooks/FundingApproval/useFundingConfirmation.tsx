import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { initialiseFundingSearchSelection } from "../../actions/FundingSearchSelectionActions";
import { useErrorContext } from "../../context/ErrorContext";
import { getLatestJob } from "../../helpers/jobDetailsHelper";
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
import { useJobSubscription } from "../Jobs/useJobSubscription";
import { useSpecificationPermissions } from "../Permissions/useSpecificationPermissions";
import { useFundingConfiguration } from "../useFundingConfiguration";
import { useSpecificationSummary } from "../useSpecificationSummary";

export const useFundingConfirmation = ({
  specificationId,
  fundingStreamId,
  fundingPeriodId,
  actionType,
}: {
  fundingStreamId: string;
  fundingPeriodId: string;
  specificationId: string;
  actionType: Exclude<FundingActionType, FundingActionType.Refresh>;
}) => {
  const dispatch = useDispatch();
  const { addErrorToContext, clearErrorsFromContext } = useErrorContext();
  const { selectedProviderIds } = useSelector<IStoreState, FundingSearchSelectionState>(
    (state) => state.fundingSearchSelection
  );
  const [fundingSummary, setFundingSummary] = useState<PublishedProviderFundingCount>();
  const [specificationLastUpdatedDate, setSpecificationLastUpdatedDate] = useState<Date>();

  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addErrorToContext({ error: err, description: "Error while loading specification" })
  );

  const { hasPermission, isPermissionsFetched } = useSpecificationPermissions(specificationId, [
    Permission.CanApproveFunding,
    Permission.CanReleaseFunding,
  ]);

  const { fundingConfiguration, isLoadingFundingConfiguration } = useFundingConfiguration(
    fundingStreamId,
    fundingPeriodId,
    (err) => addErrorToContext({ error: err, description: "Error while loading funding configuration" })
  );

  const {
    addSub,
    removeAllSubs,
    results: notifications,
  } = useJobSubscription({
    onError: (err) =>
      addErrorToContext({ error: err, description: "An error occurred while monitoring the running jobs" }),
  });

  const hasPermissionToApprove = useMemo(
    () => hasPermission && hasPermission(Permission.CanApproveFunding),
    [isPermissionsFetched]
  );
  const hasPermissionToRelease = useMemo(
    () => hasPermission && hasPermission(Permission.CanReleaseFunding),
    [isPermissionsFetched]
  );

  useEffect(() => {
    getSpecificationCalculationResultsMetadata(specificationId)
      .then((result) => {
        setSpecificationLastUpdatedDate(result.data.lastUpdated);
      })
      .catch((err) => {
        addErrorToContext({
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
          JobType.ReleaseProvidersToChannelsJob,
        ],
      },
      onError: (e) => addErrorToContext({ error: e, description: "Error while checking for background job" }),
    });

    return () => {
      removeAllSubs();
      clearErrorsFromContext();
    };
  }, []);

  useEffect(() => {
    if (!fundingConfiguration || fundingSummary || actionType == FundingActionType.Release) return;

    async function loadBatchFundingSummary() {
      const response = await publishService.getFundingSummaryForApprovingService(
        specificationId,
        selectedProviderIds
      );
      setFundingSummary(response?.data);
    }

    const getDefaultFundingStatusFilters = (action: FundingActionType) => {
      switch (action) {
        case FundingActionType.Approve: {
          return ["Updated", "Draft"];
        }
        case FundingActionType.Release: {
          return ["Approved"];
        }
        default: {
          return [];
        }
      }
    };

    async function loadFullFundingSummary() {
      const search = buildInitialPublishedProviderSearchRequest({
        fundingStreamId,
        fundingPeriodId,
        specificationId,
        fundingAction: actionType,
        status: getDefaultFundingStatusFilters(actionType),
      });
      try {
        const { data: providers } = await publishedProviderService.searchForPublishedProviderResults(search);

        const funding: PublishedProviderFundingCount = {
          count:
            actionType === FundingActionType.Approve
              ? providers.totalProvidersToApprove
              : providers.totalProvidersToPublish,
          indicativeProviderCount: 0,
          paidProviderCount: 0,
          fundingStreamsFundings: [],
          localAuthorities: [],
          localAuthoritiesCount: 0,
          providerTypes: [],
          providerTypesCount: 0,
          totalFunding: providers.totalFundingAmount,
          indicativeProviderTotalFunding: null,
          paidProvidersTotalFunding: null,
        };
        setFundingSummary(funding);
      } catch (err: any) {
        addErrorToContext({ error: err, description: "Unexpected error while fetching provider results" });
      }
    }

    if (fundingConfiguration.approvalMode === ApprovalMode.All) {
      loadFullFundingSummary();
    }
    if (fundingConfiguration.approvalMode === ApprovalMode.Batches) {
      console.log("selectedProviderIds", selectedProviderIds);
      if (selectedProviderIds.length > 0) {
        loadBatchFundingSummary();
      }
      if (selectedProviderIds.length === 0) {
        addErrorToContext({ error: `There are no selected providers to ${actionType.toLowerCase()}` });
      }
    }
  }, [fundingConfiguration]);

  const clearFundingSearchSelection = useCallback(() => {
    dispatch(initialiseFundingSearchSelection(fundingStreamId, fundingPeriodId, specificationId, actionType));
  }, [specificationId, fundingPeriodId, fundingStreamId]);

  return {
    specification,
    isLoadingSpecification,
    fundingConfiguration,
    isLoadingFundingConfiguration,
    fundingSummary,
    clearFundingSearchSelection,
    latestJob: getLatestJob(notifications.flatMap((n) => n.latestJob)),
    isWaitingForJob: notifications.some((n) => !!n.latestJob?.isActive),
    isPermissionsFetched,
    hasPermissionToApprove,
    hasPermissionToRelease,
    selectedProviderIds,
    notifications,
    specificationLastUpdatedDate,
  };
};
