import {RouteComponentProps} from "react-router";
import React, {useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {LoadingStatus} from "../../components/LoadingStatus";
import {buildInitialPublishedProviderSearchRequest, PublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";
import {SearchMode} from "../../types/SearchMode";
import {PermissionStatus} from "../../components/PermissionStatus";
import {Footer} from "../../components/Footer";
import {ErrorMessage} from "../../types/ErrorMessage";
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

export interface SpecificationFundingApprovalRoute {
    fundingStreamId: string;
    fundingPeriodId: string;
    specificationId: string;
}

export function SpecificationFundingApproval({match}: RouteComponentProps<SpecificationFundingApprovalRoute>) {
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const specificationId = match.params.specificationId;

    const {hasJob, hasActiveJob, isCheckingForJob, jobInProgressMessage} =
        useLatestSpecificationJobWithMonitoring(
            specificationId,
            [JobType.RefreshFundingJob,
                JobType.ApproveAllProviderFundingJob,
                JobType.ApproveBatchProviderFundingJob,
                JobType.PublishBatchProviderFundingJob,
                JobType.PublishAllProviderFundingJob]);
    const {specification, isLoadingSpecification, errorCheckingForSpecification} = useSpecificationSummary(specificationId);
    const initialProviderPagedSearch = buildInitialPublishedProviderSearchRequest(fundingStreamId, fundingPeriodId, specificationId);
    const initialProviderIdsSearch = buildInitialPublishedProviderIdsSearchRequest(fundingStreamId, fundingPeriodId, specificationId);
    const [searchCriteria, setSearchCriteria] = useState<PublishedProviderSearchRequest>(initialProviderPagedSearch);
    const {publishedProviderSearchResults, isLoadingSearchResults, errorLoadingSearchResults} =
        usePublishedProviderSearch(searchCriteria, !isCheckingForJob && !hasActiveJob);
    const {fundingConfiguration, isLoadingFundingConfiguration, errorLoadingFundingConfiguration} =
        useFundingConfiguration(fundingStreamId, fundingPeriodId);
    const {publishedProviderIds, isLoadingPublishedProviderIds, errorLoadingPublishedProviderIds} =
        usePublishedProviderIds(initialProviderIdsSearch, 
            !isCheckingForJob && !hasActiveJob && fundingConfiguration !== undefined && fundingConfiguration.approvalMode === ApprovalMode.Batches);
    const {publishedProvidersWithErrors, errorLoadingPublishedProviderErrors} =
        usePublishedProviderErrorSearch(initialProviderPagedSearch, !isCheckingForJob && !hasActiveJob);
    const [isConfirmingApproval, setConfirmApproval] = useState<boolean>(false);
    const [isConfirmingRelease, setConfirmRelease] = useState<boolean>(false);
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const fundingSelectionState: IFundingSelectionState = useSelector<IStoreState, IFundingSelectionState>(state => state.fundingSelection);
    const {canApproveFunding, canRefreshFunding, canReleaseFunding, missingPermissions} =
        useSpecificationPermissions(specificationId, [SpecificationPermissions.Refresh, SpecificationPermissions.Approve, SpecificationPermissions.Release]);


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

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        if (!errorMessage || errorMessage.length === 0 || 
            errors.some(err => err.message === errorMessage && err.fieldName === fieldName)) {
            return;
        }

        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        setErrors([]);
    }

    addErrorMessage(errorCheckingForSpecification);
    addErrorMessage(errorLoadingSearchResults);
    addErrorMessage(errorLoadingFundingConfiguration);
    addErrorMessage(errorLoadingPublishedProviderIds);
    addErrorMessage(errorLoadingPublishedProviderErrors);
    if (publishedProvidersWithErrors) {
        publishedProvidersWithErrors.providers.forEach(provider => {
            const ref = `provider-approval-${provider.publishedProviderVersionId}`;
            provider.errors.forEach(err => addErrorMessage(err, ref));
        })
    }
    
    const isLoading = errors.length === 0 && isLoadingSpecification || isCheckingForJob || hasActiveJob || isLoadingSearchResults || isLoadingPublishedProviderIds;


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

                <div className="govuk-grid-row govuk-!-margin-bottom-5 govuk-!-padding-top-5">
                    <div className="govuk-grid-column-two-thirds">
                        <SpecificationSummarySection
                            specification={specification}
                            isLoadingSpecification={isLoadingSpecification}
                        />
                    </div>
                </div>

                {!isConfirmingApproval && !isConfirmingRelease &&
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-third">
                        <PublishedProviderSearchFilters publishedProviderResults={publishedProviderSearchResults}
                                                        searchCriteria={searchCriteria}
                                                        setSearchCriteria={setSearchCriteria}
                                                        numberOfProvidersWithErrors={0}
                        />
                    </div>
                    <div className="govuk-grid-column-two-thirds">
                        {isLoading &&
                        <div>
                            {isLoadingSpecification ?
                                <LoadingStatus title={"Loading specification..."}/>
                                : (isCheckingForJob || hasActiveJob) ?
                                    <LoadingStatus title={`Job running: ${hasJob ? jobInProgressMessage : "Checking for jobs..."} `}
                                                   subTitle={isCheckingForJob ?
                                                       "Searching for any running jobs" :
                                                       "Monitoring job progress. Please wait, this could take several minutes"}
                                                   testid='loadingJobs'/>
                                    :
                                    <LoadingStatus title={isLoadingSearchResults ? "Loading provider funding data..." : "Applying selection..."}/>
                            }
                        </div>
                        }
                        {!isCheckingForJob && !hasActiveJob && !isLoadingSearchResults && !isLoadingFundingConfiguration && 
                        !isLoadingPublishedProviderIds && !isLoadingSpecification && specification &&
                        <PublishedProviderResults specificationId={specificationId}
                                                  enableBatchSelection={fundingConfiguration?.approvalMode === ApprovalMode.Batches}
                                                  specProviderVersionId={specification.providerVersionId}
                                                  providerSearchResults={publishedProviderSearchResults}
                                                  canRefreshFunding={canRefreshFunding}
                                                  canApproveFunding={canApproveFunding}
                                                  canReleaseFunding={canReleaseFunding}
                                                  selectedResults={fundingSelectionState.providerVersionIds.length}
                                                  totalResults={publishedProviderIds ? publishedProviderIds.length : 0}
                                                  pageChange={pageChange}
                                                  allPublishedProviderIds={publishedProviderIds}
                                                  setConfirmRelease={setConfirmRelease}
                                                  setConfirmApproval={setConfirmApproval}
                                                  addError={addErrorMessage}
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
                        />
                        :
                        <ConfirmFundingRelease
                            canReleaseFunding={canReleaseFunding}
                            specificationSummary={specification}
                            publishedProviderResults={publishedProviderSearchResults}
                            handleBackToResults={handleBackToResults}
                            addError={addErrorMessage}
                        />
                    }
                </div>
                }
            </div>
            <Footer/>
        </div>
    );
}