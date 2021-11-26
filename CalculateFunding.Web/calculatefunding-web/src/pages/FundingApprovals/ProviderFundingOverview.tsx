import { AxiosError } from "axios";
import { Main } from "components/Main";
import * as QueryString from "query-string";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { RouteComponentProps, useLocation } from "react-router";

import { BackLink } from "../../components/BackLink";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { ProviderFundingProfilingPatterns } from "../../components/Funding/ProviderFundingProfilingPatterns";
import { ProviderFundingProfilingSummary } from "../../components/Funding/ProviderFundingProfilingSummary";
import { ProviderFundingStreamHistory } from "../../components/Funding/ProviderFundingStreamHistory";
import { FundingLineResults } from "../../components/fundingLineStructure/FundingLineResults";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { LoadingStatus } from "../../components/LoadingStatus";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { ProviderSummarySection } from "../../components/Providers/ProviderSummarySection";
import { Tabs } from "../../components/Tabs";
import { useProviderVersion } from "../../hooks/Providers/useProviderVersion";
import { useCurrentPublishedProvider } from "../../hooks/PublishedProviders/useCurrentPublishedProvider";
import { useErrors } from "../../hooks/useErrors";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import { IStoreState } from "../../reducers/rootReducer";
import { getCurrentProfileConfigService } from "../../services/fundingLineDetailsService";
import {
  getProviderTransactionsService,
  getReleasedProfileTotalsService,
} from "../../services/providerService";
import { FeatureFlagsState } from "../../states/FeatureFlagsState";
import { FundingLineProfile } from "../../types/FundingLineProfile";
import { JobType } from "../../types/jobType";
import { ProviderProfileTotalsForStreamAndPeriod } from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import { ProviderTransactionSummary } from "../../types/ProviderSummary";
import { Section } from "../../types/Sections";

export interface ProviderFundingOverviewRoute {
  specificationId: string;
  providerId: string;
  specCoreProviderVersionId?: string;
  fundingStreamId: string;
  fundingPeriodId: string;
}

export function ProviderFundingOverview({ match }: RouteComponentProps<ProviderFundingOverviewRoute>) {
  const specificationId = match.params.specificationId;
  const providerId = match.params.providerId;
  const fundingStreamId = match.params.fundingStreamId;
  const fundingPeriodId = match.params.fundingPeriodId;
  const specCoreProviderVersionId = match.params.specCoreProviderVersionId;
  const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(
    (state) => state.featureFlags
  );
  const [initialTab, setInitialTab] = useState<string>("");
  const location = useLocation();
  const { errors, addError, clearErrorMessages } = useErrors();

  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({ error: err, description: "Error while loading specification" })
  );

  const { providerVersion, isLoadingProviderVersion } = useProviderVersion(
    providerId,
    specCoreProviderVersionId ? specCoreProviderVersionId : "",
    (err: AxiosError) => addError({ error: err, description: "Error while loading provider" })
  );

  const { publishedProviderVersion, isLoadingPublishedProviderVersion } = useCurrentPublishedProvider(
    specificationId,
    fundingStreamId,
    providerId,
    (err: AxiosError) =>
      addError({ error: err, description: "Error while loading current published provider" })
  );

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<
    ProviderTransactionSummary,
    AxiosError
  >(
    `provider-transactions-for-spec-${specificationId}-provider-${providerId}`,
    async () => (await getProviderTransactionsService(specificationId, providerId)).data,
    { onError: (err) => addError({ error: err, description: "Error while loading provider transactions" }) }
  );

  const { data: profilingPatterns, isLoading: isLoadingProfilingPatterns } = useQuery<
    FundingLineProfile[],
    AxiosError
  >(
    `provider-profiling-pattern-for-spec-${specificationId}-provider-${providerId}-stream-${fundingStreamId}`,
    async () => (await getCurrentProfileConfigService(specificationId, providerId, fundingStreamId)).data,
    {
      enabled: featureFlagsState.profilingPatternVisible,
      onError: (err) =>
        err.response?.status === 404
          ? addError({
              error: "No profile patterns found for this provider",
              description: "Error while loading profile patterns",
            })
          : addError({ error: err, description: "Error while loading profile patterns" }),
      onSuccess: (data) => {
        data.forEach((profilePattern) => {
          profilePattern.errors?.forEach((err) => {
            addError({ error: err.detailedErrorMessage, description: err.summaryErrorMessage });
          });
        });
      },
    }
  );

  const { data: profileTotals, isLoading: isLoadingProfileTotals } = useQuery<
    ProviderProfileTotalsForStreamAndPeriod,
    AxiosError
  >(
    `provider-profile-for-stream-${fundingStreamId}-period-${fundingPeriodId}-provider-${providerId}`,
    async () => (await getReleasedProfileTotalsService(fundingStreamId, fundingPeriodId, providerId)).data,
    {
      enabled:
        featureFlagsState.profilingPatternVisible !== undefined && !featureFlagsState.profilingPatternVisible,
      retry: 1,
      onError: (err) =>
        err.response?.status === 404
          ? addError({
              error: "No profile totals found for this provider",
              description: "Error while loading profile totals",
            })
          : addError({ error: err, description: "Error while loading profile totals" }),
    }
  );

  useEffect(() => {
    const params = QueryString.parse(location.search);

    if (params.showProfiling) {
      setInitialTab("profiling");
    } else {
      setInitialTab("funding-stream-history");
    }
  }, [location]);

  return (
    <Main location={Section.Approvals}>
      <Breadcrumbs>
        <Breadcrumb name={"Calculate funding"} url={"/"} />
        <Breadcrumb name={"Approvals"} />
        <Breadcrumb name={"Select specification"} url={"/Approvals/Select"} />
        <Breadcrumb
          name={"Funding approval results"}
          url={`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}
        />
        <Breadcrumb name={"Provider funding overview"} />
      </Breadcrumbs>

      <MultipleErrorSummary errors={errors} />

      <ProviderSummarySection
        specification={specification}
        isLoadingSpecification={isLoadingSpecification}
        providerVersion={providerVersion}
        publishedProviderVersion={publishedProviderVersion}
        isLoadingProviderVersion={isLoadingProviderVersion}
        isLoadingPublishedProviderVersion={isLoadingPublishedProviderVersion}
        status={isLoadingTransactions ? "" : transactions ? transactions.latestStatus : ""}
        fundingTotal={isLoadingTransactions ? "" : transactions ? transactions.fundingTotal : ""}
      />

      {initialTab.length > 0 && (
        <div className="govuk-grid-row govuk-!-padding-top-5">
          <div className="govuk-grid-column-full">
            <Tabs initialTab={initialTab}>
              <ul className="govuk-tabs__list">
                <Tabs.Tab label="funding-stream-history">Funding stream history</Tabs.Tab>
                <Tabs.Tab label="profiling">Profiling</Tabs.Tab>
                <Tabs.Tab label="calculations">Calculations</Tabs.Tab>
              </ul>
              <Tabs.Panel label="funding-stream-history">
                {isLoadingTransactions && <LoadingStatus title="Loading..." />}
                {!isLoadingTransactions && transactions && (
                  <ProviderFundingStreamHistory transactions={transactions} />
                )}
              </Tabs.Panel>
              <Tabs.Panel label="profiling">
                {featureFlagsState.profilingPatternVisible
                  ? isLoadingProfilingPatterns
                  : (isLoadingSpecification || isLoadingProfileTotals) && (
                      <LoadingStatus title={"Loading..."} />
                    )}
                {!featureFlagsState.profilingPatternVisible &&
                  !isLoadingSpecification &&
                  specification &&
                  profileTotals &&
                  !isLoadingProfileTotals && (
                    <ProviderFundingProfilingSummary
                      routeParams={match.params}
                      specification={specification}
                      profileTotals={profileTotals}
                    />
                  )}
                {featureFlagsState.profilingPatternVisible &&
                  !isLoadingProfilingPatterns &&
                  profilingPatterns && (
                    <ProviderFundingProfilingPatterns
                      routeParams={match.params}
                      profilingPatterns={profilingPatterns}
                    />
                  )}
              </Tabs.Panel>
              <Tabs.Panel label="calculations">
                  {isLoadingSpecification && <LoadingFieldStatus title="Loading specification..." />}
                  {specification && (
                    <FundingLineResults
                      specification={specification}
                      providerId={providerId}
                      addError={addError}
                      jobTypes={[
                        JobType.RefreshFundingJob,
                        JobType.ApproveAllProviderFundingJob,
                        JobType.ApproveBatchProviderFundingJob,
                        JobType.PublishAllProviderFundingJob,
                        JobType.PublishBatchProviderFundingJob,
                        JobType.PublishedFundingUndoJob,
                      ]}
                      clearErrorMessages={clearErrorMessages}
                    />
                  )}
              </Tabs.Panel>
            </Tabs>
          </div>
        </div>
      )}
      <div className="govuk-clearfix"></div>
      <BackLink />
    </Main>
  );
}
