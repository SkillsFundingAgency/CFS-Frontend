import {RouteComponentProps} from "react-router";
import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PublishedProviderSearchResults} from "../../types/PublishedProvider/PublishedProviderSearchResults";
import {LoadingStatus} from "../../components/LoadingStatus";
import {PublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";
import {SearchMode} from "../../types/SearchMode";
import {PermissionStatus} from "../../components/PermissionStatus";
import {Footer} from "../../components/Footer";
import {ErrorMessage} from "../../types/ErrorMessage";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {PublishedProviderResults} from "../../components/Funding/PublishedProviderResults";
import {ConfirmFundingApproval} from "../../components/Funding/ConfirmFundingApproval";
import {ConfirmFundingRelease} from "../../components/Funding/ConfirmFundingRelease";
import {PublishedProviderSearchFilters} from "../../components/Funding/PublishedProviderSearchFilters";
import {getAllProviderVersionIdsForSearch, searchForPublishedProviderResults} from "../../services/publishedProviderService";
import {getFundingConfiguration} from "../../services/policyService";
import {ApprovalMode} from "../../types/ApprovalMode";
import {IFundingSelectionState} from "../../states/IFundingSelectionState";
import {useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {SpecificationSummarySection} from "../../components/Funding/SpecificationSummarySection";
import {SpecificationPermissions, useSpecificationPermissions} from "../../hooks/useSpecificationPermissions";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";

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
    const {specification, isLoadingSpecification, haveErrorCheckingForSpecification, errorCheckingForSpecification} =
        useSpecificationSummary(specificationId);

    const [publishedProviderResults, setPublishedProviderResults] = useState<PublishedProviderSearchResults>({
        facets: [],
        canApprove: false,
        canPublish: false,
        currentPage: 0,
        endItemNumber: 0,
        filteredFundingAmount: 0,
        pagerState: {
            previousPage: 0,
            nextPage: 0,
            displayNumberOfPages: 0,
            lastPage: 0,
            pages: [],
            currentPage: 0
        },
        providers: [],
        startItemNumber: 0,
        totalFundingAmount: 0,
        totalProvidersToApprove: 0,
        totalProvidersToPublish: 0,
        totalResults: 0
    });
    const initialSearch: PublishedProviderSearchRequest = {
        searchTerm: "",
        status: [],
        providerType: [],
        providerSubType: [],
        localAuthority: [],
        fundingStreamId: fundingStreamId,
        hasErrors: undefined,
        searchMode: SearchMode.All,
        pageSize: 50,
        pageNumber: 1,
        includeFacets: true,
        facetCount: 0,
        fundingPeriodId: fundingPeriodId,
        errorToggle: "",
        searchFields: []
    };
    const [searchCriteria, setSearchCriteria] = useState<PublishedProviderSearchRequest>(initialSearch);
    const [isLoadingResults, setIsLoadingResults] = useState<boolean>(true);
    const [isLoadingProviderVersionIds, setIsLoadingProviderVersionIds] = useState<boolean>(false);
    const [isConfirmingApproval, setConfirmApproval] = useState<boolean>(false);
    const [isConfirmingRelease, setConfirmRelease] = useState<boolean>(false);
    const [approvalMode, setApprovalMode] = useState<ApprovalMode>(ApprovalMode.Undefined);
    const [allProviderVersionIds, setAllProviderVersionIds] = useState<string[]>([]);
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const fundingSelectionState: IFundingSelectionState = useSelector<IStoreState, IFundingSelectionState>(state => state.fundingSelection);
    const {canApproveFunding, canRefreshFunding, canReleaseFunding, missingPermissions} =
        useSpecificationPermissions(specificationId, [SpecificationPermissions.Refresh, SpecificationPermissions.Approve, SpecificationPermissions.Release]);

    useEffect(() => {
        if (!isCheckingForJob && !hasActiveJob) {
            loadPublishedProviderResults(searchCriteria);
        }
    }, [searchCriteria, hasActiveJob, isCheckingForJob]);

    async function loadPublishedProviderResults(searchRequest: PublishedProviderSearchRequest) {
        clearErrorMessages();
        if (!isLoadingResults) {
            setIsLoadingResults(true);
        }
        try {
            const results = (await searchForPublishedProviderResults(searchRequest)).data;
            setIsLoadingResults(false);
            setPublishedProviderResults(results);

            if (approvalMode === ApprovalMode.Undefined) {
                const fundingConfiguration = (await getFundingConfiguration(fundingStreamId, fundingPeriodId)).data;
                if (fundingConfiguration) {
                    setApprovalMode(fundingConfiguration.approvalMode);
                    if (fundingConfiguration.approvalMode === ApprovalMode.Batches) {
                        setAllProviderVersionIds(await loadPublishedProviderVersionIds());
                    }
                }
            }
        } catch (e) {
            setIsLoadingResults(false);
            addErrorMessage(`Error while loading results: ${e}`);
        }
    }

    async function loadPublishedProviderVersionIds(): Promise<string[]> {
        setIsLoadingProviderVersionIds(true);

        // N.B. could be a LOT of results!
        try {
            const allProviderVersionIds = await getAllProviderVersionIdsForSearch(searchCriteria);
            setIsLoadingProviderVersionIds(false);
            return allProviderVersionIds.data;
        } catch (e) {
            addErrorMessage("Error while loading provider version ids: " + e);
            setIsLoadingProviderVersionIds(false);
            return [];
        }
    }

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
        if (errors.some(err => err.message === errorMessage && err.fieldName === fieldName)) {
            return;
        }
            
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        setErrors([]);
    }

    if (haveErrorCheckingForSpecification) {
        addErrorMessage(errorCheckingForSpecification);
    }
    const isLoading = errors.length === 0 && isLoadingSpecification || isCheckingForJob || hasActiveJob || isLoadingResults || isLoadingProviderVersionIds;
    
    
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

                <PermissionStatus requiredPermissions={missingPermissions} hidden={isLoadingResults}/>

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
                        <PublishedProviderSearchFilters publishedProviderResults={publishedProviderResults}
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
                                    <LoadingStatus title={isLoadingResults ? "Loading provider funding data..." : "Applying selection..."}/>
                            }
                        </div>
                        }
                        {!isCheckingForJob && !hasActiveJob && !isLoadingResults && !isLoadingProviderVersionIds && !isLoadingSpecification && specification &&
                        <PublishedProviderResults specificationId={specificationId}
                                                  enableBatchSelection={approvalMode === ApprovalMode.Batches}
                                                  specProviderVersionId={specification.providerVersionId}
                                                  providerSearchResults={publishedProviderResults}
                                                  canRefreshFunding={canRefreshFunding}
                                                  canApproveFunding={canApproveFunding}
                                                  canReleaseFunding={canReleaseFunding}
                                                  selectedResults={fundingSelectionState.providerVersionIds.length}
                                                  totalResults={allProviderVersionIds?.length}
                                                  pageChange={pageChange}
                                                  fetchPublishedProviderIds={loadPublishedProviderVersionIds}
                                                  setConfirmRelease={setConfirmRelease}
                                                  setConfirmApproval={setConfirmApproval}
                                                  addError={addErrorMessage}
                        />
                        }
                    </div>
                </div>
                }
                {!isLoadingResults && specification &&
                <div className="govuk-grid-row">
                    {isConfirmingApproval && !isConfirmingRelease ?
                        <ConfirmFundingApproval
                            canApproveFunding={canApproveFunding}
                            specificationSummary={specification}
                            publishedProviderResults={publishedProviderResults}
                            handleBackToResults={handleBackToResults}
                            addError={addErrorMessage}
                        />
                        :
                        <ConfirmFundingRelease
                            canReleaseFunding={canReleaseFunding}
                            specificationSummary={specification}
                            publishedProviderResults={publishedProviderResults}
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