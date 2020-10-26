import React, {useEffect, useState} from 'react';
import {RouteComponentProps, useHistory, useLocation} from "react-router";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {useSelector} from "react-redux";
import {Tabs} from "../../components/Tabs";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {FeatureFlagsState} from "../../states/FeatureFlagsState";
import {IStoreState} from "../../reducers/rootReducer";
import {ProviderTransactionSummary} from "../../types/ProviderSummary";
import {ProviderProfileTotalsForStreamAndPeriod} from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import {getCurrentProfileConfigService} from "../../services/fundingLineDetailsService";
import {FundingLineProfile} from "../../types/FundingLineProfile";
import {LoadingStatus} from "../../components/LoadingStatus";
import * as QueryString from "query-string";
import {ProviderFundingProfilingPatterns} from "../../components/Funding/ProviderFundingProfilingPatterns";
import {ProviderFundingProfilingSummary} from "../../components/Funding/ProviderFundingProfilingSummary";
import {ProviderFundingStreamHistory} from "../../components/Funding/ProviderFundingStreamHistory";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useQuery} from "react-query";
import {AxiosError} from 'axios';
import {
    getReleasedProfileTotalsService,
    getProviderTransactionsService
} from "../../services/providerService";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {useProviderVersion} from "../../hooks/Providers/useProviderVersion";
import {ProviderSummarySection} from "../../components/Providers/ProviderSummarySection";
import {useErrors} from "../../hooks/useErrors";

interface ProviderFundingOverviewProps {
    providerFundingId: string
}

export interface ProviderFundingOverviewRoute {
    providerId: string;
    providerVersionId: string;
    specificationId: string;
    fundingStreamId: string;
    fundingPeriodId: string;
}

export function ProviderFundingOverview({match}: RouteComponentProps<ProviderFundingOverviewRoute>, props: ProviderFundingOverviewProps) {
    const specificationId = match.params.specificationId;
    const providerId = match.params.providerId;
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const providerVersionId = match.params.providerVersionId;
    const featureFlagsState: FeatureFlagsState = useSelector<IStoreState, FeatureFlagsState>(state => state.featureFlags);
    const [initialTab, setInitialTab] = useState<string>("");
    const location = useLocation();
    let history = useHistory();

    const {specification, isLoadingSpecification} =
        useSpecificationSummary(specificationId, err => addErrorMessage(err.message, "Error while loading specification"));

    const {providerVersion, isLoadingProviderVersion} = useProviderVersion(providerId, providerVersionId,
        (err: AxiosError) => addErrorMessage(err.message, "Error while loading provider"));

    const {data: transactions, isLoading: isLoadingTransactions} =
        useQuery<ProviderTransactionSummary, AxiosError>(`provider-transactions-for-spec-${specificationId}-provider-${providerId}`,
            async () => (await getProviderTransactionsService(specificationId, providerId)).data,
            {onError: err => addErrorMessage(err.message, "Error while loading provider transactions")});

    const {data: profilingPatterns, isLoading: isLoadingProfilingPatterns} =
        useQuery<FundingLineProfile[], AxiosError>(`provider-profiling-pattern-for-spec-${specificationId}-provider-${providerId}-stream-${fundingStreamId}`,
            async () => (await getCurrentProfileConfigService(specificationId, providerId, fundingStreamId)).data,
            {
                enabled: featureFlagsState.profilingPatternVisible,
                onError: err => err.response?.status === 404 ?
                    addErrorMessage("No profile patterns found for this provider", "Error while loading profile patterns") :
                    addErrorMessage(err.message, "Error while loading profile patterns")
            });

    const {data: profileTotals, isLoading: isLoadingProfileTotals} =
        useQuery<ProviderProfileTotalsForStreamAndPeriod, AxiosError>(`provider-profile-for-stream-${fundingStreamId}-period-${fundingPeriodId}-provider-${providerId}`,
            async () => (await getReleasedProfileTotalsService(fundingStreamId, fundingPeriodId, providerId)).data,
            {
                enabled: featureFlagsState.profilingPatternVisible !== undefined && !featureFlagsState.profilingPatternVisible,
                retry: 1,
                onError: err => err.response?.status === 404 ?
                    addErrorMessage("No profile totals found for this provider", "Error while loading profile totals") :
                    addErrorMessage(err.message, "Error while loading profile totals")
            });
    const {errors, addErrorMessage} = useErrors();

    useEffect(() => {
        const params = QueryString.parse(location.search);

        if (params.showProfiling) {
            setInitialTab("profiling");
        } else {
            setInitialTab("funding-stream-history")
        }
    }, [location]);

    return <div>
        <Header location={Section.Approvals}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Approvals"}/>
                <Breadcrumb name={"Select specification"} url={"/Approvals/Select"}/>
                <Breadcrumb name={"Funding approval results"}
                            url={`/Approvals/SpecificationFundingApproval/${match.params.fundingStreamId}/${match.params.fundingPeriodId}/${match.params.specificationId}`}/>
                <Breadcrumb name={"Provider funding overview"}/>
            </Breadcrumbs>

            <MultipleErrorSummary errors={errors}/>

            <ProviderSummarySection
                specification={specification}
                isLoadingSpecification={isLoadingSpecification}
                providerVersion={providerVersion}
                isLoadingProviderVersion={isLoadingProviderVersion}/>

            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <div className="funding-status">
                        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible"/>
                        <div className="govuk-grid-row">
                            <div className="govuk-grid-column-one-half">
                                <p className="govuk-body">Latest status: <strong className="govuk-warning-text">
                                    {isLoadingTransactions ? <LoadingFieldStatus title="Loading..."/> : transactions ? transactions.latestStatus : ""}
                                </strong></p>
                            </div>
                            <div className="govuk-grid-column-one-half">
                                <p className="govuk-body">Funding total: <strong className="govuk-warning-text">
                                    {isLoadingTransactions ? <LoadingFieldStatus title="Loading..."/> : transactions ? transactions.fundingTotal : ""}
                                </strong></p>
                            </div>
                        </div>
                        <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible govuk-!-margin-bottom-5"/>
                    </div>
                </div>
            </div>
            {initialTab.length > 0 &&
            <div className="govuk-grid-row govuk-!-padding-top-5">
                <div className="govuk-grid-column-full">
                    <Tabs initialTab={initialTab}>
                        <ul className="govuk-tabs__list">
                            <Tabs.Tab label="funding-stream-history">Funding stream history</Tabs.Tab>
                            <Tabs.Tab label="profiling">Profiling</Tabs.Tab>
                        </ul>
                        <Tabs.Panel label="funding-stream-history">
                            {isLoadingTransactions &&
                            <LoadingStatus title="Loading..."/>}
                            {!isLoadingTransactions && transactions &&
                            <ProviderFundingStreamHistory transactions={transactions}/>
                            }
                        </Tabs.Panel>
                        <Tabs.Panel label="profiling">
                            {featureFlagsState.profilingPatternVisible ? isLoadingProfilingPatterns : isLoadingSpecification || isLoadingProfileTotals &&
                                <LoadingStatus title={"Loading..."}/>
                            }
                            {!featureFlagsState.profilingPatternVisible && !isLoadingSpecification && specification && profileTotals && !isLoadingProfileTotals &&
                            <ProviderFundingProfilingSummary
                                routeParams={match.params}
                                specification={specification}
                                profileTotals={profileTotals}
                            />
                            }
                            {featureFlagsState.profilingPatternVisible && !isLoadingProfilingPatterns && profilingPatterns &&
                            <ProviderFundingProfilingPatterns
                                routeParams={match.params}
                                profilingPatterns={profilingPatterns}/>
                            }
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </div>}
            <div className="govuk-clearfix"></div>
            <a href="#" className="govuk-back-link" onClick={history.goBack}>Back</a>
        </div>
        <Footer/>
    </div>;
}
