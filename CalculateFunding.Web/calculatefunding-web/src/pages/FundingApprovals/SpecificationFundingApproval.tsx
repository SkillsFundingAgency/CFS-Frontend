import {RouteComponentProps} from "react-router";
import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PublishedProviderSearchResult} from "../../types/PublishedProvider/PublishedProviderSearchResult";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {LoadingStatus} from "../../components/LoadingStatus";
import {PublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";
import {SearchMode} from "../../types/SearchMode";
import {getJobStatusUpdatesForSpecification} from "../../services/jobService";
import {approveFundingService, refreshFundingService, releaseFundingService} from "../../services/publishService";
import {getUserPermissionsService} from "../../services/userService";
import {EffectiveSpecificationPermission} from "../../types/EffectiveSpecificationPermission";
import {PermissionStatus} from "../../components/PermissionStatus";
import {FacetValue} from "../../types/Facet";
import {Footer} from "../../components/Footer";
import {AxiosError} from "axios";
import {HubConnectionBuilder} from "@microsoft/signalr";
import {JobMessage} from "../../types/jobMessage";
import {RunningStatus} from "../../types/RunningStatus";
import {JobSummary} from "../../types/jobSummary";
import {ErrorMessage} from "../../types/ErrorMessage";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {PublishedProviderResults} from "../../components/Funding/PublishedProviderResults";
import {ConfirmFundingApproval} from "../../components/Funding/ConfirmFundingApproval";
import {ConfirmFundingRelease} from "../../components/Funding/ConfirmFundingRelease";
import {PublishedProviderSearchFilters} from "../../components/Funding/PublishedProviderSearchFilters";
import {getAllProviderVersionIdsForSearch, searchForPublishedProviderResults} from "../../services/publishedProviderService";
import {getFundingConfiguration} from "../../services/policyService";
import {ApprovalMode} from "../../types/ApprovalMode";

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
    const [isLoadingSpec, setIsLoadingSpec] = useState<boolean>(true);
    const [isLoadingResults, setIsLoadingResults] = useState<boolean>(true);
    const [isLoadingProviderVersionIds, setIsLoadingProviderVersionIds] = useState<boolean>(false);
    const [isConfirmingApproval, setConfirmApproval] = useState<boolean>(false);
    const [isConfirmingRelease, setConfirmRelease] = useState<boolean>(false);
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>();
    const [latestJob, setLatestJob] = useState<JobSummary | undefined>({});
    const [statusFacets, setStatusFacets] = useState<FacetValue[]>([]);
    const [providerTypeFacets, setProviderTypeFacets] = useState<FacetValue[]>([]);
    const [providerSubTypeFacets, setProviderSubTypeFacets] = useState<FacetValue[]>([]);
    const [localAuthorityFacets, setLocalAuthorityFacets] = useState<FacetValue[]>([]);
    const [jobProgressMessage, setJobProgressMessage] = useState<string>("Checking for any jobs running");
    const [userPermissions, setUserPermissions] = useState<EffectiveSpecificationPermission>({
        canEditTemplates: false,
        canDeleteTemplates: false,
        canCreateTemplates: false,
        canApproveTemplates: false,
        userId: "",
        specificationId: "",
        canReleaseFunding: false,
        canRefreshFunding: false,
        canMapDatasets: false,
        canEditSpecification: false,
        canEditQaTests: false,
        canEditCalculations: false,
        canDeleteSpecification: false,
        canDeleteQaTests: false,
        canDeleteCalculations: false,
        canCreateSpecification: false,
        canCreateQaTests: false,
        canChooseFunding: false,
        canApproveSpecification: false,
        canApproveFunding: false,
        canAdministerFundingStream: false
    });
    const [approvalMode, setApprovalMode] = useState<ApprovalMode>(ApprovalMode.Undefined);
    const [allProviderVersionIds, setAllProviderVersionIds] = useState<string[]>([]);
    const [errors, setErrors] = useState<ErrorMessage[]>([]);
    const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
    const jobTypes = "RefreshFundingJob,ApproveAllProviderFundingJob,ApproveBatchProviderFundingJob,PublishBatchProviderFundingJob,PublishAllProviderFundingJob";

    useEffect(() => {
        getUserPermissions();

        getSpecificationSummaryService(specificationId)
            .then((result) => setSpecificationSummary(result.data))
            .catch((err: AxiosError) => addErrorMessage(`Error while fetching specification details: ${err.message}`))
            .finally(() => setIsLoadingSpec(false));

        checkForExistingRunningJob();

    }, [specificationId]);
    
    useEffect(() => {
        if (isInitialisingJobMonitor) {
            return;
        }
        // is job running?
        if (latestJob !== undefined && latestJob.runningStatus && latestJob.runningStatus !== RunningStatus.Completed) {
            switch (latestJob.jobType) {
                case "RefreshFundingJob":
                    setJobProgressMessage("Refreshing funding");
                    break;
                case "ApproveFunding":
                    setJobProgressMessage("Approving funding");
                    break;
                case "PublishProviderFundingJob":
                    setJobProgressMessage("Releasing funding");
                    break;
                case "ApproveAllProviderFundingJob":
                    setJobProgressMessage("Approving all provider funding");
                    break;
                case "ApproveBatchProviderFundingJob":
                    setJobProgressMessage("Approving batch provider funding");
                    break;
                case "PublishBatchProviderFundingJob":
                    setJobProgressMessage("Publishing batch provider funding");
                    break;
                case "PublishAllProviderFundingJob":
                    setJobProgressMessage("Publishing all provider funding");
                    break;
                default:
                    setJobProgressMessage(latestJob.jobType ? latestJob.jobType : "");
                    break;
            }
        } else {
            loadPublishedProviderResults(searchCriteria);
        }
    }, [searchCriteria, latestJob]);

    async function checkForExistingRunningJob() {
        getJobStatusUpdatesForSpecification(specificationId, jobTypes)
            .then((result) => {
                setIsInitialisingJobMonitor(false);
                if (result.data && result.data.length > 0) {
                    const runningJob = result.data.find((item) => item !== null && item.runningStatus !== RunningStatus.Completed);
                    if (runningJob) {
                        setLatestJob({
                            jobId: runningJob.jobId,
                            jobType: runningJob.jobType,
                            completionStatus: runningJob.completionStatus,
                            runningStatus: runningJob.runningStatus,
                            lastUpdated: runningJob.lastUpdated
                        });
                    } else {
                        setLatestJob(undefined);
                    }
                } else {
                    setLatestJob(undefined);
                }
            })
            .catch((error: AxiosError) => {
                setLatestJob(undefined);
                addErrorMessage(`Error while checking for existing jobs: ${error.message}`);
            })
            .finally(() => {
                monitorSpecJobNotifications(specificationId);
            });
    }

    async function monitorSpecJobNotifications(specId: string) {
        const hubConnect = new HubConnectionBuilder()
            .withUrl(`/api/notifications`)
            .build();
        try {
            await hubConnect.start();
            hubConnect.on('NotificationEvent', (job: JobMessage) => {
                if (job && job.runningStatus && job.runningStatus !== RunningStatus.Completed) {
                    setLatestJob({
                        jobId: job.jobId,
                        jobType: job.jobType,
                        completionStatus: job.completionStatus,
                        runningStatus: job.runningStatus as unknown as RunningStatus,
                        lastUpdated: job.statusDateTime as unknown as Date
                    });
                } else {
                    setLatestJob(undefined);
                }
            });
            await hubConnect.invoke("StartWatchingForSpecificationNotifications", specId);
        } catch (err) {
            addErrorMessage(`Error while monitoring jobs: ${err.message}`);
            await hubConnect.stop();
            // re-trigger job monitoring
            await checkForExistingRunningJob();
        }
    }

    async function loadPublishedProviderResults(searchRequest: PublishedProviderSearchRequest) {
        clearErrorMessages();
        if (!isLoadingResults) {
            setIsLoadingResults(true);
        }
        try {
            const results = (await searchForPublishedProviderResults(searchRequest)).data;
            setIsLoadingResults(false);
            setPublishedProviderResults(results);
            if (results.facets != null) {
                results.facets.forEach((facet) => {
                    switch (facet.name) {
                        case "providerType":
                            setProviderTypeFacets(facet.facetValues);
                            break;
                        case "providerSubType":
                            setProviderSubTypeFacets(facet.facetValues);
                            break;
                        case "localAuthority":
                            setLocalAuthorityFacets(facet.facetValues);
                            break;
                        case "fundingStatus":
                            setStatusFacets(facet.facetValues);
                            break;
                    }
                });
            }
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

    function filterByLocalAuthority(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = searchCriteria.localAuthority;

        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchCriteria(prevState => {
            return {...prevState, localAuthority: filterUpdate, pageNumber: 1}
        });

        searchCriteria.localAuthority = filterUpdate;
    }

    function filterByStatus(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = searchCriteria.status;

        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchCriteria(prevState => {
            return {...prevState, status: filterUpdate, pageNumber: 1}
        });

        searchCriteria.status = filterUpdate;
    }

    function filterByProviderType(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = searchCriteria.providerType;

        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchCriteria(prevState => {
            return {...prevState, providerType: filterUpdate, pageNumber: 1}
        });

        searchCriteria.providerType = filterUpdate;

    }

    function filterByProviderSubType(e: React.ChangeEvent<HTMLInputElement>) {
        let filterUpdate = searchCriteria.providerSubType;

        if (e.target.checked) {
            filterUpdate.push(e.target.value);
        } else {
            const position = filterUpdate.indexOf(e.target.value);
            filterUpdate.splice(position, 1);
        }
        setSearchCriteria(prevState => {
            return {...prevState, providerSubType: filterUpdate, pageNumber: 1}
        });

        searchCriteria.providerSubType = filterUpdate;
    }

    function filterByText(searchData: any) {
        if ((searchData.searchTerm.length === 0 && searchCriteria.searchTerm.length !== 0) || searchData.searchTerm.length > 2) {
            let searchFields: string[] = [];
            if (searchData.searchField != null && searchData.searchField !== "") {
                searchFields.push(searchData.searchField);
            }
            setSearchCriteria(prevState => {
                return {...prevState, searchTerm: searchData.searchTerm, searchFields: searchFields, pageNumber: 1}
            })
        }
    }

    function handleRefreshFunding() {
        refreshFundingService(specificationId)
    }

    function handleApprove() {
        setConfirmApproval(true);
    }

    function handleBack() {
        setConfirmApproval(false);
        setConfirmRelease(false);
        clearErrorMessages();
    }

    function handleRelease() {
        setConfirmRelease(true);
    }

    function handleConfirmApprove() {
        approveFundingService(specificationId);
    }

    function handleConfirmRelease() {
        releaseFundingService(specificationId);
    }

    function getUserPermissions() {
        getUserPermissionsService(specificationId)
            .then((result) => {
                setUserPermissions(result.data);
                if (!result.data.canApproveFunding) {
                    if (!missingPermissions.find(x => x === "approve")) {
                        setMissingPermissions(prevState => [...prevState, "approve"]);
                    }
                }
                if (!result.data.canReleaseFunding) {
                    if (!missingPermissions.find(x => x === "release")) {
                        setMissingPermissions(prevState => [...prevState, "release"]);
                    }
                }
                if (!result.data.canRefreshFunding) {
                    if (!missingPermissions.find(x => x === "refresh")) {
                        setMissingPermissions(prevState => [...prevState, "refresh"]);
                    }
                }
            });
    }

    function addErrorMessage(errorMessage: string, fieldName?: string) {
        const errorCount: number = errors.length;
        const error: ErrorMessage = {id: errorCount + 1, fieldName: fieldName, message: errorMessage};
        setErrors(errors => [...errors, error]);
    }

    function clearErrorMessages() {
        setErrors([]);
    }

    const isJobRunning = latestJob && (!latestJob.runningStatus || latestJob.runningStatus && latestJob.runningStatus !== RunningStatus.Completed);

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
                    {isLoadingSpec &&
                    <LoadingStatus title={`Loading specification`} testid='loadingSpecification'/>
                    }
                    {!isLoadingSpec && specificationSummary &&
                    <>
                        <span className="govuk-caption-xl">Specification</span>
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-2" data-testid="specName">{specificationSummary.name}</h1>
                        <span className="govuk-caption-m">Funding period</span>
                        <h1 className="govuk-heading-m" data-testid="fundingPeriodName">{specificationSummary.fundingPeriod.name}</h1>
                        <span className="govuk-caption-m">Funding stream</span>
                        <h1 className="govuk-heading-m" data-testid="fundingStreamName">{specificationSummary.fundingStreams[0].name}</h1>
                    </>
                    }
                </div>
            </div>

            <div className="govuk-grid-row">
                {isJobRunning &&
                <LoadingStatus title={`Job running: ${jobProgressMessage} `}
                               subTitle={isInitialisingJobMonitor ? "Searching for any running jobs" : "Monitoring job progress. Please wait, this could take several minutes"}
                               testid='loadingJobs'/>
                }

                {!isJobRunning && !isConfirmingApproval && !isConfirmingRelease && specificationSummary &&
                <>
                    <PublishedProviderSearchFilters isLoadingResults={isLoadingResults}
                                                    publishedProviderResults={publishedProviderResults}
                                                    specificationSummary={specificationSummary as SpecificationSummary}
                                                    statuses={statusFacets}
                                                    localAuthorities={localAuthorityFacets}
                                                    providerSubTypes={providerSubTypeFacets}
                                                    providerTypes={providerTypeFacets}
                                                    handleFilterByLocalAuthority={filterByLocalAuthority}
                                                    handleFilterByProviderSubType={filterByProviderSubType}
                                                    handleFilterByProviderType={filterByProviderType}
                                                    handleFilterByStatus={filterByStatus}
                                                    handleFilterByText={filterByText}
                    />
                    <PublishedProviderResults isLoading={isLoadingResults}
                                              isLoadingProviderIds={isLoadingProviderVersionIds}
                                              fundingStreamId={fundingStreamId}
                                              fundingPeriodId={fundingPeriodId}
                                              enableToggles={approvalMode === ApprovalMode.Batches}
                                              specification={specificationSummary}
                                              providerSearchResults={publishedProviderResults}
                                              userPermissions={userPermissions}
                                              pageChange={pageChange}
                                              fetchPublishedProviderIds={loadPublishedProviderVersionIds}
                                              handleRefreshFunding={handleRefreshFunding}
                                              handleApprove={handleApprove}
                                              handleRelease={handleRelease}/>
                </>
                }

                {!isLoadingResults && specificationSummary &&
                <>
                    {isConfirmingApproval && !isConfirmingRelease ?
                        <ConfirmFundingApproval
                            userPermissions={userPermissions}
                            specificationSummary={specificationSummary as SpecificationSummary}
                            publishedProviderResults={publishedProviderResults}
                            handleBack={handleBack}
                            handleConfirmApprove={handleConfirmApprove}
                        />
                        :
                        <ConfirmFundingRelease
                            userPermissions={userPermissions}
                            specificationSummary={specificationSummary as SpecificationSummary}
                            publishedProviderResults={publishedProviderResults}
                            handleBack={handleBack}
                            handleConfirmRelease={handleConfirmRelease}
                        />
                    }
                </>
                }
            </div>
        </div>
        <Footer/>
    </div>
}