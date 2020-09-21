import {RouteComponentProps} from "react-router";
import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PublishedProviderSearchResult} from "../../types/PublishedProvider/PublishedProviderSearchResult";
import {SpecificationSummary} from "../../types/SpecificationSummary";
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
import {SpecificationJobMonitor} from "../../components/Funding/SpecificationJobMonitor";
import {SpecificationPermissions, useSpecificationPermissions} from "../../hooks/useSpecificationPermissions";

export interface SpecificationFundingApprovalRoute {
    fundingStreamId: string;
    fundingPeriodId: string;
    specificationId: string;
}

export function SpecificationFundingApproval({match}: RouteComponentProps<SpecificationFundingApprovalRoute>) {
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const specificationId = match.params.specificationId;

    const [publishedProviderResults, setPublishedProviderResults] = useState<PublishedProviderSearchResult>({
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
        totalErrorResults: 0,
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
    const [isInitialisingJobMonitor, setIsInitialisingJobMonitor] = useState<boolean>(true);
    const [isJobRunning, setIsJobRunning] = useState<boolean>(true);
    const [isLoadingResults, setIsLoadingResults] = useState<boolean>(true);
    const [isLoadingProviderVersionIds, setIsLoadingProviderVersionIds] = useState<boolean>(false);
    const [isConfirmingApproval, setConfirmApproval] = useState<boolean>(false);
    const [isConfirmingRelease, setConfirmRelease] = useState<boolean>(false);
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>();
    const [approvalMode, setApprovalMode] = useState<ApprovalMode>(ApprovalMode.Undefined);
    const [allProviderVersionIds, setAllProviderVersionIds] = useState<string[]>([]);
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const fundingSelectionState: IFundingSelectionState = useSelector<IStoreState, IFundingSelectionState>(state => state.fundingSelection);
    const {canApproveFunding, canRefreshFunding, canReleaseFunding, missingPermissions} = 
        useSpecificationPermissions(specificationId, [SpecificationPermissions.Refresh, SpecificationPermissions.Approve, SpecificationPermissions.Release]);

    useEffect(() => {
        if (!isInitialisingJobMonitor && !isJobRunning) {
            loadPublishedProviderResults(searchCriteria);
        }
    }, [searchCriteria, isJobRunning, isInitialisingJobMonitor]);

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

    function handleBack() {
        setConfirmApproval(false);
        setConfirmRelease(false);
        clearErrorMessages();
    }

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        setErrors([]);
    }
    
    return <div>
        <Header location={Section.Approvals}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Approvals"}/>
                <Breadcrumb name={"Select specification"} url={"/Approvals/Select"}/>
                <Breadcrumb name={"Funding approval results"}/>
            </Breadcrumbs>

            <PermissionStatus requiredPermissions={missingPermissions}/>
            
            <MultipleErrorSummary errors={errors}/>

            <div className="govuk-grid-row govuk-!-margin-bottom-5 govuk-!-padding-top-5">
                <div className="govuk-grid-column-two-thirds">
                    <SpecificationSummarySection 
                        specificationId={specificationId} 
                        specification={specificationSummary}
                        setSpecification={setSpecificationSummary}
                        addError={addErrorMessage}
                    />
                </div>
            </div>

            <div className="govuk-grid-row">
                
                <SpecificationJobMonitor 
                    specificationId={specificationId}
                    isJobRunning={isJobRunning}
                    setIsJobRunning={setIsJobRunning}
                    isInitialising={isInitialisingJobMonitor}
                    setIsInitialising={setIsInitialisingJobMonitor}
                    addError={addErrorMessage}
                />

                {!isJobRunning && !isConfirmingApproval && !isConfirmingRelease && specificationSummary &&
                <>
                    <PublishedProviderSearchFilters publishedProviderResults={publishedProviderResults}
                                                    specificationSummary={specificationSummary as SpecificationSummary}
                                                    searchCriteria={searchCriteria}
                                                    setSearchCriteria={setSearchCriteria}
                    />
                    {(isLoadingResults || isLoadingProviderVersionIds) &&
                    <div className="govuk-grid-column-two-thirds">
                        <LoadingStatus title={isLoadingResults ? "Loading provider funding data" : "Applying selection..."}/>
                    </div>
                    }
                    {!isLoadingResults && !isLoadingProviderVersionIds &&
                    <PublishedProviderResults specificationId={specificationId} 
                                              enableBatchSelection={approvalMode === ApprovalMode.Batches}
                                              specProviderVersionId={specificationSummary?.providerVersionId}
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
                    />
                    }
                </>
                }

                {!isLoadingResults && specificationSummary &&
                <>
                    {isConfirmingApproval && !isConfirmingRelease ?
                        <ConfirmFundingApproval
                            canApproveFunding={canApproveFunding}
                            specificationSummary={specificationSummary as SpecificationSummary}
                            publishedProviderResults={publishedProviderResults}
                            handleBack={handleBack}
                        />
                        :
                        <ConfirmFundingRelease
                            canReleaseFunding={canReleaseFunding}
                            specificationSummary={specificationSummary as SpecificationSummary}
                            publishedProviderResults={publishedProviderResults}
                            handleBack={handleBack}
                        />
                    }
                </>
                }
            </div>
        </div>
        <Footer/>
    </div>
}