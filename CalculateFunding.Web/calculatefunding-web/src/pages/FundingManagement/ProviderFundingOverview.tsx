import { AxiosError } from "axios";
import { Main } from "components/Main";
import * as QueryString from "query-string";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { RouteComponentProps, useLocation } from "react-router";

import { BackLink } from "../../components/BackLink";
import { Breadcrumb, Breadcrumbs } from "../../components/Breadcrumbs";
import { CalculationsTab } from "../../components/Funding/CalculationsTab";
import { FundingResultsBreadcrumb } from "../../components/Funding/FundingResultsBreadcrumb";
import { FundingSelectionBreadcrumb } from "../../components/Funding/FundingSelectionBreadcrumb";
import { ProviderDataTab } from "../../components/Funding/ProviderDataTab";
import { ProviderFundingProfilingPatterns } from "../../components/Funding/ProviderFundingProfilingPatterns";
import { ProviderFundingProfilingSummary } from "../../components/Funding/ProviderFundingProfilingSummary";
import { ProviderFundingStreamHistory } from "../../components/Funding/ProviderFundingStreamHistory";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { LoadingStatus } from "../../components/LoadingStatus";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { ProviderSummarySection } from "../../components/Providers/ProviderSummarySection";
import { Tabs } from "../../components/Tabs";
import { useErrorContext } from "../../context/ErrorContext";
import { useProviderVersion } from "../../hooks/Providers/useProviderVersion";
import { useCurrentPublishedProvider } from "../../hooks/PublishedProviders/useCurrentPublishedProvider";
import { useSpecificationSummary } from "../../hooks/useSpecificationSummary";
import { IStoreState } from "../../reducers/rootReducer";
import { getCurrentProfileConfigService } from "../../services/fundingLineDetailsService";
import {
  getProviderTransactionsService,
  getReleasedProfileTotalsService,
} from "../../services/providerService";
import { FeatureFlagsState } from "../../states/FeatureFlagsState";
import { FundingLineProfile } from "../../types/FundingLineProfile";
import { ProviderProfileTotalsForStreamAndPeriod } from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import { ProviderTransactionSummary } from "../../types/ProviderSummary";
import { FundingActionType } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { Section } from "../../types/Sections";

export interface ProviderFundingOverviewRoute {
  actionType: FundingActionType;
  specificationId: string;
  providerId: string;
  specCoreProviderVersionId?: string;
}

export function ProviderFundingOverview({ match }: RouteComponentProps<ProviderFundingOverviewRoute>) {
  const { actionType, specificationId, providerId, specCoreProviderVersionId } = match.params;
  const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(
    (state) => state.featureFlags
  );
  const [initialTab, setInitialTab] = useState<string>("");
  const location = useLocation();
  const { state: errors, addErrorToContext: addError, clearErrorsFromContext } = useErrorContext();

  const { specification, isLoadingSpecification } = useSpecificationSummary(specificationId, (err) =>
    addError({ error: err, description: "Error while loading specification" })
  );

  const fundingStreamId = specification && specification.fundingStreams[0]?.id;
  const fundingPeriodId = specification && specification.fundingPeriod?.id;

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
    async () =>
      (await getCurrentProfileConfigService(specificationId, providerId, fundingStreamId as string)).data,
    {
      enabled: !!fundingStreamId && featureFlagsState.profilingPatternVisible,
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
    async () =>
      (
        await getReleasedProfileTotalsService(
          fundingStreamId as string,
          fundingPeriodId as string,
          providerId
        )
      ).data,
    {
      enabled:
        !!fundingStreamId &&
        !!fundingPeriodId &&
        featureFlagsState.profilingPatternVisible !== undefined &&
        !featureFlagsState.profilingPatternVisible,
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

  useEffect(() => {
    return clearErrorsFromContext;
  }, []);

  return (
    <Main location={Section.FundingManagement}>
      <Breadcrumbs>
        <Breadcrumb name="Calculate funding" url="/" />
        <Breadcrumb name="Funding Management" url="/FundingManagement" />
        <FundingSelectionBreadcrumb actionType={actionType} />
        <FundingResultsBreadcrumb
          actionType={actionType}
          specificationId={specificationId}
          specificationName={specification?.name}
          fundingPeriodId={fundingPeriodId}
          fundingStreamId={fundingStreamId}
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
                <Tabs.Tab label="provider-data">Provider data</Tabs.Tab>
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
                      <LoadingStatus title="Loading..." />
                    )}
                {!featureFlagsState.profilingPatternVisible &&
                  !isLoadingSpecification &&
                  specification &&
                  fundingStreamId &&
                  fundingPeriodId &&
                  profileTotals &&
                  !isLoadingProfileTotals && (
                    <ProviderFundingProfilingSummary
                      {...match.params}
                      specification={specification}
                      profileTotals={profileTotals}
                    />
                  )}
                {featureFlagsState.profilingPatternVisible &&
                  !isLoadingProfilingPatterns &&
                  specification &&
                  profilingPatterns && (
                    <ProviderFundingProfilingPatterns
                      {...match.params}
                      specification={specification}
                      profilingPatterns={profilingPatterns}
                    />
                  )}
              </Tabs.Panel>
              <Tabs.Panel label="calculations">
                {isLoadingSpecification && <LoadingFieldStatus title="Loading specification..." />}
                {specification && (
                  <CalculationsTab
                    specification={specification}
                    providerId={providerId}
                    transactions={transactions}
                  />
                )}
              </Tabs.Panel>
              <Tabs.Panel label="provider-data">
                <ProviderDataTab providerId={providerId} providerVersionId={specCoreProviderVersionId} />
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
