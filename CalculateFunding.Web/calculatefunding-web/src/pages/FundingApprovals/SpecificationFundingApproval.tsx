import {RouteComponentProps} from "react-router";
import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingStatus} from "../../components/LoadingStatus";
import {
    buildInitialPublishedProviderSearchRequest,
    PublishedProviderSearchRequest
} from "../../types/publishedProviderSearchRequest";
import {PermissionStatus} from "../../components/PermissionStatus";
import {Footer} from "../../components/Footer";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {PublishedProviderResults} from "../../components/Funding/PublishedProviderResults";
import {ConfirmFundingApproval} from "../../components/Funding/ConfirmFundingApproval";
import {ConfirmFundingRelease} from "../../components/Funding/ConfirmFundingRelease";
import {PublishedProviderSearchFilters} from "../../components/Funding/PublishedProviderSearchFilters";
import {ApprovalMode} from "../../types/ApprovalMode";
import {IFundingSelectionState} from "../../states/IFundingSelectionState";
import {useSelector} from "react-redux";
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
import {buildInitialPublishedProviderIdsSearchRequest} from "../../types/publishedProviderIdsSearchRequest";
import {useErrors} from "../../hooks/useErrors";
import {CalculationJobNotification} from "../../components/Calculations/CalculationJobNotification";

export interface SpecificationFundingApprovalRoute {
    fundingStreamId: string;
    fundingPeriodId: string;
    specificationId: string;
}

export function SpecificationFundingApproval({match}: RouteComponentProps<SpecificationFundingApprovalRoute>) {
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const specificationId = match.params.specificationId;

    const {hasActiveJob, hasJobError, jobError, latestJob, isCheckingForJob, jobStatus} =
        useLatestSpecificationJobWithMonitoring(
            specificationId,
            [JobType.RefreshFundingJob,
                JobType.ApproveAllProviderFundingJob,
                JobType.ApproveBatchProviderFundingJob,
                JobType.PublishBatchProviderFundingJob,
                JobType.PublishAllProviderFundingJob]);
    const {specification, isLoadingSpecification} =
        useSpecificationSummary(specificationId, err => addErrorMessage(err.message, "Error while loading specification") );
    const initialProviderPagedSearch = buildInitialPublishedProviderSearchRequest(fundingStreamId, fundingPeriodId, specificationId);
    const initialProviderIdsSearch = buildInitialPublishedProviderIdsSearchRequest(fundingStreamId, fundingPeriodId, specificationId);
    const [searchCriteria, setSearchCriteria] = useState<PublishedProviderSearchRequest>(initialProviderPagedSearch);
    const {publishedProviderSearchResults, isLoadingSearchResults} =
        usePublishedProviderSearch(searchCriteria, !isCheckingForJob && !hasActiveJob,
            err => addErrorMessage(err.message, "", "Error while searching for provider results"));
    const {fundingConfiguration, isLoadingFundingConfiguration} =
        useFundingConfiguration(fundingStreamId, fundingPeriodId,
            err => addErrorMessage(err.message, "", "Error while loading funding configuration"));
    const {publishedProviderIds, isLoadingPublishedProviderIds} =
        usePublishedProviderIds(initialProviderIdsSearch,
            !isCheckingForJob && !hasActiveJob && fundingConfiguration !== undefined && fundingConfiguration.approvalMode === ApprovalMode.Batches,
            err => addErrorMessage(err.message, "", "Error while loading provider ids"));
    const {publishedProvidersWithErrors} =
        usePublishedProviderErrorSearch(specificationId, !isCheckingForJob && !hasActiveJob,
    err => addErrorMessage(err.message, "Error while loading provider funding errors"));
    const [isConfirmingApproval, setConfirmApproval] = useState<boolean>(false);
    const [isConfirmingRelease, setConfirmRelease] = useState<boolean>(false);
    const fundingSelectionState: IFundingSelectionState = useSelector<IStoreState, IFundingSelectionState>(state => state.fundingSelection);
    const {canApproveFunding, canRefreshFunding, canReleaseFunding, missingPermissions} =
        useSpecificationPermissions(specificationId, [SpecificationPermissions.Refresh, SpecificationPermissions.Approve, SpecificationPermissions.Release]);
    const [isLoadingRefresh, setIsLoadingRefresh] = useState<boolean>(false);
    const {errors, addErrorMessage, clearErrorMessages} = useErrors();


    function pageChange(pageNumber: string) {
        setSearchCriteria(prevState => {
            return {...prevState, pageNumber: parseInt(pageNumber)}
        });
    }

    function handleBackToResults() {
        setConfirmApproval(false);
        setConfirmRelease(false);
        clearErrorMessages();
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
                <CalculationJobNotification
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

                {!isConfirmingApproval && !isConfirmingRelease &&
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-third" hidden={hasActiveJob || isCheckingForJob}>
                        <PublishedProviderSearchFilters publishedProviderResults={publishedProviderSearchResults}
                                                        searchCriteria={searchCriteria}
                                                        setSearchCriteria={setSearchCriteria}
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
                        <PublishedProviderResults specificationId={specificationId}
                                                  enableBatchSelection={fundingConfiguration?.approvalMode === ApprovalMode.Batches}
                                                  specProviderVersionId={specification.providerVersionId}
                                                  providerSearchResults={publishedProviderSearchResults}
                                                  canRefreshFunding={canRefreshFunding}
                                                  canApproveFunding={canApproveFunding}
                                                  canReleaseFunding={canReleaseFunding}
                                                  selectedResults={fundingSelectionState.providerVersionIds.length}
                                                  totalResults={publishedProviderIds ? publishedProviderIds.length : publishedProviderSearchResults ? publishedProviderSearchResults.totalResults : 0}
                                                  pageChange={pageChange}
                                                  allPublishedProviderIds={publishedProviderIds}
                                                  setConfirmRelease={setConfirmRelease}
                                                  setConfirmApproval={setConfirmApproval}
                                                  addError={addErrorMessage}
                                                  setIsLoadingRefresh={setIsLoadingRefresh}
                                                  clearErrorMessages={clearErrorMessages}
                        />
                        }
                    </div>
                </div>
                }
                {!isLoadingSearchResults && (isConfirmingApproval || isConfirmingRelease) && specification &&
                <div className="govuk-grid-row">
                    {isConfirmingApproval && !isConfirmingRelease ?
                        <ConfirmFundingApproval
                            canApproveFunding={canApproveFunding}
                            specificationSummary={specification}
                            publishedProviderResults={publishedProviderSearchResults}
                            handleBackToResults={handleBackToResults}
                            addError={addErrorMessage}
                            clearErrorMessages={clearErrorMessages}
                        />
                        :
                        <ConfirmFundingRelease
                            canReleaseFunding={canReleaseFunding}
                            specificationSummary={specification}
                            publishedProviderResults={publishedProviderSearchResults}
                            handleBackToResults={handleBackToResults}
                            addError={addErrorMessage}
                            clearErrorMessages={clearErrorMessages}
                        />
                    }
                </div>
                }
            </div>
            <Footer/>
        </div>
    );
}