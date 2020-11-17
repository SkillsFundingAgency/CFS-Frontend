import {RouteComponentProps, useHistory} from "react-router";
import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingStatus} from "../../components/LoadingStatus";
import {PermissionStatus} from "../../components/PermissionStatus";
import {Footer} from "../../components/Footer";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {PublishedProviderResults} from "../../components/Funding/PublishedProviderResults";
import {PublishedProviderSearchFilters} from "../../components/Funding/PublishedProviderSearchFilters";
import {ApprovalMode} from "../../types/ApprovalMode";
import {FundingSearchSelectionState} from "../../states/FundingSearchSelectionState";
import {useDispatch, useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {SpecificationSummarySection} from "../../components/Funding/SpecificationSummarySection";
import {SpecificationPermissions, useSpecificationPermissions} from "../../hooks/useSpecificationPermissions";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {usePublishedProviderSearch} from "../../hooks/FundingApproval/usePublishedProviderSearch";
import {useFundingConfiguration} from "../../hooks/useFundingConfiguration";
import {usePublishedProviderErrorSearch} from "../../hooks/FundingApproval/usePublishedProviderErrorSearch";
import {usePublishedProviderIds} from "../../hooks/FundingApproval/usePublishedProviderIds";
import {useErrors} from "../../hooks/useErrors";
import {JobNotificationBanner} from "../../components/Calculations/JobNotificationBanner";
import {initialiseFundingSearchSelection} from "../../actions/FundingSearchSelectionActions";
import {FundingActionType} from "../../types/PublishedProvider/PublishedProviderFundingCount";
import {refreshSpecificationFundingService} from "../../services/publishService";

export interface SpecificationFundingApprovalRouteProps {
    fundingStreamId: string;
    fundingPeriodId: string;
    specificationId: string;
}

export function SpecificationFundingApproval({match}: RouteComponentProps<SpecificationFundingApprovalRouteProps>) {
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const specificationId = match.params.specificationId;

    const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(state => state.fundingSearchSelection);
    const {hasActiveJob, hasJobError, jobError, latestJob, isCheckingForJob, jobStatus} =
        useLatestSpecificationJobWithMonitoring(
            specificationId,
            [JobType.RefreshFundingJob,
                JobType.ApproveAllProviderFundingJob,
                JobType.ApproveBatchProviderFundingJob,
                JobType.PublishBatchProviderFundingJob,
                JobType.PublishAllProviderFundingJob]);
    const {specification, isLoadingSpecification} =
        useSpecificationSummary(specificationId, err => addErrorMessage(err.message, "Error while loading specification"));
    const {publishedProviderSearchResults, isLoadingSearchResults} =
        usePublishedProviderSearch(state.searchCriteria, true,
            err => addErrorMessage(err.message, "", "Error while searching for providers"));
    const {fundingConfiguration, isLoadingFundingConfiguration} =
        useFundingConfiguration(fundingStreamId, fundingPeriodId,
            err => addErrorMessage(err.message, "", "Error while loading funding configuration"));
    const {publishedProviderIds, isLoadingPublishedProviderIds} =
        usePublishedProviderIds(fundingStreamId, fundingPeriodId, specificationId,
            !isCheckingForJob && !hasActiveJob && fundingConfiguration !== undefined && fundingConfiguration.approvalMode === ApprovalMode.Batches,
            err => addErrorMessage(err.message, "", "Error while loading provider ids"));
    const {publishedProvidersWithErrors} =
        usePublishedProviderErrorSearch(specificationId, !isCheckingForJob && !hasActiveJob,
            err => addErrorMessage(err.message, "Error while loading provider funding errors"));
    const {canApproveFunding, canRefreshFunding, canReleaseFunding, missingPermissions} =
        useSpecificationPermissions(specificationId, [SpecificationPermissions.Refresh, SpecificationPermissions.Approve, SpecificationPermissions.Release]);
    const [isLoadingRefresh, setIsLoadingRefresh] = useState<boolean>(false);
    const {errors, addErrorMessage, clearErrorMessages} = useErrors();
    const dispatch = useDispatch();
    const history = useHistory();


    useEffect(() => {
        if (!state.searchCriteria ||
            (state.searchCriteria &&
            state.searchCriteria.specificationId !== specificationId)) {
            dispatch(initialiseFundingSearchSelection(match.params.fundingStreamId, match.params.fundingPeriodId, match.params.specificationId));
        }
    }, [match, state]);

    async function handleApprove() {
        if (publishedProviderSearchResults && canApproveFunding && publishedProviderSearchResults.canApprove) {
            history.push(`/Approvals/ConfirmFunding/${fundingStreamId}/${fundingPeriodId}/${specificationId}/${FundingActionType.Approve}`);
        }
    }

    async function handleRelease() {
        if (publishedProviderSearchResults && publishedProviderSearchResults.canPublish && canReleaseFunding) {
            history.push(`/Approvals/ConfirmFunding/${fundingStreamId}/${fundingPeriodId}/${specificationId}/${FundingActionType.Release}`);
        }
    }

    async function handleRefresh() {
        clearErrorMessages();
        setIsLoadingRefresh(true);
        try {
            await refreshSpecificationFundingService(specificationId);
        } catch (e) {
            addErrorMessage("An error occured whilst calling the server to refresh: " + e);
        } finally {
            setIsLoadingRefresh(false);
        }
    }

    if (publishedProvidersWithErrors) {
        publishedProvidersWithErrors.forEach(err => addErrorMessage(err, "Provider error"));
    }

    const isLoading = errors.length === 0 && (isLoadingSpecification || isLoadingFundingConfiguration || isCheckingForJob || hasActiveJob || isLoadingSearchResults || isLoadingPublishedProviderIds || isLoadingRefresh);
    const loadingTitle =
        isLoadingSpecification ? "Loading specification..." :
            isLoadingRefresh ? "Updating..." :
                isCheckingForJob ? "Checking for jobs..." :
                    hasActiveJob && jobStatus ? `Job ${jobStatus.statusDescription}: ${jobStatus.jobDescription}` :
                        isLoadingSearchResults ? "Loading provider funding data..." :
                            isLoadingFundingConfiguration ? "Loading funding configuration..." :
                                ""
    const loadingSubtitle =
        isLoadingRefresh ? "Refreshing data" :
            isCheckingForJob ? "Searching for any running jobs" :
                hasActiveJob ? "Monitoring job progress. Please wait, this could take several minutes" :
                    "";

    return (
        <div>
            <Header location={Section.Approvals}/>
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"}/>
                    <Breadcrumb name={"Approvals"}/>
                    <Breadcrumb name={"Select specification"} url={"/Approvals/Select"}/>
                    <Breadcrumb name={"Funding approval results"}/>
                </Breadcrumbs>

                <PermissionStatus requiredPermissions={missingPermissions} hidden={!publishedProviderSearchResults}/>

                <MultipleErrorSummary errors={errors}/>

                {!isCheckingForJob && jobStatus && jobStatus.isComplete &&
                <JobNotificationBanner
                    latestJob={latestJob}
                    isCheckingForJob={isCheckingForJob}
                    jobStatus={jobStatus}
                    hasJobError={hasJobError}
                    jobError={jobError}/>
                }

                <SpecificationSummarySection
                    specification={specification}
                    isLoadingSpecification={isLoadingSpecification}
                />

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-third" hidden={hasActiveJob || isCheckingForJob}>
                        <PublishedProviderSearchFilters
                            facets={publishedProviderSearchResults ? publishedProviderSearchResults.facets : []}
                            numberOfProvidersWithErrors={0}
                        />
                    </div>
                    <div className="govuk-grid-column-two-thirds">
                        {isLoading &&
                        <div>
                            <LoadingStatus title={loadingTitle} subTitle={loadingSubtitle}/>
                        </div>
                        }
                        {!isCheckingForJob && !hasActiveJob && !isLoadingSearchResults &&
                        !isLoadingPublishedProviderIds && !isLoadingSpecification && specification &&
                        <PublishedProviderResults
                            specificationId={specificationId}
                            fundingStreamId={fundingStreamId}
                            fundingPeriodId={fundingPeriodId}
                            versionId={specification.providerVersionId}
                            enableBatchSelection={fundingConfiguration?.approvalMode === ApprovalMode.Batches}
                            providerSearchResults={publishedProviderSearchResults}
                            canRefreshFunding={canRefreshFunding}
                            canApproveFunding={canApproveFunding}
                            canReleaseFunding={canReleaseFunding}
                            totalResults={publishedProviderIds ? publishedProviderIds.length : publishedProviderSearchResults ? publishedProviderSearchResults.totalResults : 0}
                            allPublishedProviderIds={publishedProviderIds}
                            setIsLoadingRefresh={setIsLoadingRefresh}
                            addError={addErrorMessage}
                            clearErrorMessages={clearErrorMessages}
                        />
                        }
                    </div>
                    <div className="govuk-grid-column-two-thirds">
                        <div className="right-align">
                            <button className="govuk-button govuk-!-margin-right-1"
                                    disabled={hasActiveJob || !canRefreshFunding}
                                    onClick={handleRefresh}>Refresh funding
                            </button>
                            <button className="govuk-button govuk-!-margin-right-1"
                                    disabled={hasActiveJob || !publishedProviderSearchResults?.canApprove || !canApproveFunding}
                                    onClick={handleApprove}>Approve funding
                            </button>
                            <button className="govuk-button govuk-button--warning"
                                    disabled={hasActiveJob || !publishedProviderSearchResults?.canPublish || !canReleaseFunding}
                                    onClick={handleRelease}>Release funding
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
}