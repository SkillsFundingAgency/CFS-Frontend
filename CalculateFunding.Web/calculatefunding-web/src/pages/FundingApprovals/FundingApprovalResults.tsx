import {RouteComponentProps} from "react-router";
import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {getPublishedProviderResultsService} from "../../services/publishedProviderService";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {CollapsiblePanel} from "../../components/CollapsiblePanel";
import {PublishProviderSearchResultViewModel} from "../../types/PublishedProvider/PublishProviderSearchResultViewModel";
import {FormattedNumber, NumberType} from "../../components/FormattedNumber";
import {BackToTop} from "../../components/BackToTop";
import Pagination from "../../components/Pagination";
import {getSpecificationSummaryService} from "../../services/specificationService";
import {SpecificationSummary} from "../../types/SpecificationSummary";
import {LoadingStatus} from "../../components/LoadingStatus";
import {SearchRequestViewModel} from "../../types/searchRequestViewModel";
import {SearchMode} from "../../types/SearchMode";
import {getJobStatusUpdatesForSpecification} from "../../services/jobService";
import {Link} from "react-router-dom";
import {approveFundingService, refreshFundingService, releaseFundingService} from "../../services/publishService";
import {getUserPermissionsService} from "../../services/userService";
import {EffectiveSpecificationPermission} from "../../types/EffectiveSpecificationPermission";
import {BackButton} from "../../components/BackButton";
import {PermissionStatus} from "../../components/PermissionStatus";
import {NoData} from "../../components/NoData";
import {FacetValue} from "../../types/Facet";
import {CollapsibleSearchBox} from "../../components/CollapsibleSearchBox";
import {Footer} from "../../components/Footer";
import {AxiosError} from "axios";
import {DateFormatter} from "../../components/DateFormatter";
import {HubConnectionBuilder} from "@microsoft/signalr";
import {JobMessage} from "../../types/jobMessage";
import {RunningStatus} from "../../types/RunningStatus";
import {JobSummary} from "../../types/jobSummary";

export interface FundingApprovalResultsRoute {
    fundingStreamId: string;
    fundingPeriodId: string;
    specificationId: string;
}

export function FundingApprovalResults({match}: RouteComponentProps<FundingApprovalResultsRoute>) {
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const specificationId = match.params.specificationId;

    const [publishedProviderResults, setPublishedProviderResults] = useState<PublishProviderSearchResultViewModel>({
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
    const initialSearch: SearchRequestViewModel = {
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
    const [searchCriteria, setSearchCriteria] = useState<SearchRequestViewModel>(initialSearch);
    const [isInitialisingJobMonitor, setIsInitialisingJobMonitor] = useState<boolean>(true);
    const [isLoadingSpec, setIsLoadingSpec] = useState<boolean>(true);
    const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);
    const [isConfirmingApproval, setConfirmApproval] = useState<boolean>(false);
    const [isConfirmingRelease, setConfirmRelease] = useState<boolean>(false);
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>();
    const [latestJob, setLatestJob] = useState<JobSummary | undefined>({});
    const [filterStatus, setFilterStatus] = useState<FacetValue[]>([]);
    const [filterProviderType, setFilterProviderType] = useState<FacetValue[]>([]);
    const [filterProviderSubType, setFilterProviderSubType] = useState<FacetValue[]>([]);
    const [filterLocalAuthority, setFilterLocalAuthority] = useState<FacetValue[]>([]);
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
    const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
    const jobTypes = "RefreshFundingJob,ApproveAllProviderFundingJob,ApproveBatchProviderFundingJob,PublishBatchProviderFundingJob,PublishAllProviderFundingJob";

    useEffect(() => {
        getUserPermissions();

        getSpecificationSummaryService(specificationId)
            .then((result) => setSpecificationSummary(result.data))
            .finally(() => setIsLoadingSpec(false));

        checkForExistingRunningJob();

    }, [specificationId]);

    useEffect(() => {
        if (isInitialisingJobMonitor) {
            return;
        }
        if (latestJob === undefined || latestJob.runningStatus === RunningStatus.Completed) {
            getPublishedProviderResults(searchCriteria);
            populatePublishedProviderResultsService(searchCriteria);
        }
        if (latestJob && latestJob.runningStatus) {
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
            await hubConnect.stop();
            // re-trigger job monitoring
            await checkForExistingRunningJob();
        }
    }

    function getPublishedProviderResults(searchRequestViewModel: SearchRequestViewModel) {
        setIsLoadingResults(true);
        getPublishedProviderResultsService(searchRequestViewModel)
            .then((result) => {
                setPublishedProviderResults(result.data);
                if (result.data.facets != null) {
                    result.data.facets.forEach((facet) => {
                        switch (facet.name) {
                            case "providerType":
                                setFilterProviderType(facet.facetValues);
                                break;
                            case "providerSubType":
                                setFilterProviderSubType(facet.facetValues);
                                break;
                            case "localAuthority":
                                setFilterLocalAuthority(facet.facetValues);
                                break;
                            case "fundingStatus":
                                setFilterStatus(facet.facetValues);
                                break;
                        }
                    });
                }
            })
            .finally(() => setIsLoadingResults(false));
    }

    function pageChange(pageNumber: string) {
        setSearchCriteria(prevState => {
            return {...prevState, pageNumber: parseInt(pageNumber)}
        });
    }

    function populatePublishedProviderResultsService(criteria: SearchRequestViewModel) {
        setIsLoadingResults(true);
        getPublishedProviderResultsService(criteria)
            .then((result) => setPublishedProviderResults(result.data))
            .finally(() => setIsLoadingResults(false));
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
            return {...prevState, localAuthority: filterUpdate}
        });

        searchCriteria.localAuthority = filterUpdate;

        populatePublishedProviderResultsService(searchCriteria);
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
            return {...prevState, status: filterUpdate}
        });

        searchCriteria.status = filterUpdate;

        populatePublishedProviderResultsService(searchCriteria);
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
            return {...prevState, providerType: filterUpdate}
        });

        searchCriteria.providerType = filterUpdate;

        populatePublishedProviderResultsService(searchCriteria);
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
            return {...prevState, providerSubType: filterUpdate}
        });

        searchCriteria.providerSubType = filterUpdate;

        populatePublishedProviderResultsService(searchCriteria);
    }

    function filterByText(searchData: any) {
        if ((searchData.searchTerm.length === 0 && searchCriteria.searchTerm.length !== 0) || searchData.searchTerm.length > 2) {
            let searchFields: string[] = [];
            if (searchData.searchField != null && searchData.searchField !== "")
            {
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

    const isJobRunning = latestJob && (!latestJob.runningStatus || latestJob.runningStatus && latestJob.runningStatus !== RunningStatus.Completed);
    const haveResults = !isLoadingResults && publishedProviderResults.providers && publishedProviderResults.providers.length > 0;

    return <div>
        <Header location={Section.Approvals}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Select specification"} url={"/ViewFunding"}/>
                <Breadcrumb name={"Funding approval results"}/>
            </Breadcrumbs>
            <PermissionStatus requiredPermissions={missingPermissions}/>
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

            {isJobRunning &&
            <LoadingStatus title={`Job running: ${jobProgressMessage} `} subTitle={"Please wait, this could take several minutes"} testid='loadingJobs'/>
            }

            {!isJobRunning && !isConfirmingApproval && !isConfirmingRelease &&
            <div className="govuk-grid-row ">
                <div className="govuk-grid-column-one-third">
                    {(!publishedProviderResults.providers || publishedProviderResults.providers.length === 0) &&
                    <LoadingStatus title={`Loading filters`} testid='loadingFilters'/>
                    }
                    {publishedProviderResults.providers && publishedProviderResults.providers.length > 0 &&
                    <>
                        <CollapsiblePanel title={"Search"} expanded={true}>
                            <fieldset className="govuk-fieldset" aria-describedby="how-contacted-conditional-hint">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m filterbyHeading">
                                    <h4 className="govuk-heading-s">Search</h4>
                                </legend>
                                <span id="how-contacted-conditional-hint" className="govuk-hint sidebar-search-span">
                                Select one option.
                            </span>
                                <CollapsibleSearchBox searchTerm={""} callback={filterByText}/>
                            </fieldset>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by provider type"} expanded={filterProviderType.length > 0}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                </div>
                                <div className="govuk-checkboxes">
                                    {filterProviderType.map((s, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   id={`providerType-${s.name}`}
                                                   name={`providerType-${s.name}`}
                                                   type="checkbox" value={s.name}
                                                   onChange={filterByProviderType}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`providerType-${s.name}`}>
                                                {s.name}
                                            </label>
                                        </div>)
                                    }
                                </div>
                            </fieldset>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by provider sub type"} expanded={filterProviderSubType.length > 0}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-form-group">
                                    <label className="govuk-label">Search</label>
                                </div>
                                <div className="govuk-checkboxes">
                                    {filterProviderSubType.map((s, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   id={`providerType-${s.name}`}
                                                   name={`providerType-${s.name}`}
                                                   type="checkbox" value={s.name}
                                                   onChange={filterByProviderSubType}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`providerType-${s.name}`}>
                                                {s.name}
                                            </label>
                                        </div>)
                                    }
                                </div>
                            </fieldset>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by status"} expanded={filterStatus.length > 0}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-checkboxes">
                                    {filterStatus.map((s, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   id={`fundingPeriods-${s.name}`}
                                                   name={`fundingPeriods-${s.name}`}
                                                   type="checkbox" value={s.name}
                                                   onChange={filterByStatus}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`fundingPeriods-${s.name}`}>
                                                {s.name}
                                            </label>
                                        </div>)
                                    }
                                </div>
                            </fieldset>
                        </CollapsiblePanel>
                        <CollapsiblePanel title={"Filter by local authority"} expanded={filterLocalAuthority.length > 0}>
                            <fieldset className="govuk-fieldset">
                                <div className="govuk-checkboxes">
                                    {filterLocalAuthority.map((s, index) =>
                                        <div key={index} className="govuk-checkboxes__item">
                                            <input className="govuk-checkboxes__input"
                                                   id={`localAuthority-${s.name}`}
                                                   name={`localAuthority-${s.name}`}
                                                   type="checkbox" value={s.name}
                                                   onChange={filterByLocalAuthority}/>
                                            <label className="govuk-label govuk-checkboxes__label"
                                                   htmlFor={`localAuthority-${s.name}`}>
                                                {s.name}
                                            </label>
                                        </div>)
                                    }
                                </div>
                            </fieldset>
                        </CollapsiblePanel>
                    </>
                    }
                </div>
                <div className="govuk-grid-column-two-thirds">
                    {isLoadingResults &&
                    <LoadingStatus title={"Loading funding data"}/>
                    }
                    {!isLoadingResults &&
                    <>
                        <NoData hidden={publishedProviderResults.providers.length > 0}/>
                        {publishedProviderResults.providers.length > 0 &&
                        <table className="govuk-table">
                            <thead>
                            <tr>
                                <th className="govuk-table__header govuk-body">Provider name</th>
                                <th className="govuk-table__header govuk-body">UKPRN</th>
                                <th className="govuk-table__header govuk-body">Status</th>
                                <th className="govuk-table__header govuk-body">
                                    Funding total<br/>
                                    <FormattedNumber value={publishedProviderResults.totalFundingAmount}
                                                     type={NumberType.FormattedMoney}/><br/>
                                    <p className="govuk-body-s">of filtered providers</p>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {specificationSummary && publishedProviderResults.providers.map(ppr =>
                                <tr key={ppr.id}>
                                    <td className="govuk-table__cell govuk-body">
                                        <Link
                                            to={`/FundingApprovals/ProviderFundingOverview/${ppr.specificationId}/${ppr.ukprn}/${specificationSummary.providerVersionId}`}>{ppr.providerName}</Link>
                                    </td>
                                    <td className="govuk-table__cell govuk-body">{ppr.ukprn}</td>
                                    <td className="govuk-table__cell govuk-body">{ppr.fundingStatus}</td>
                                    <td className="govuk-table__cell govuk-body">
                                        <FormattedNumber value={ppr.fundingValue} type={NumberType.FormattedMoney} decimalPoint={2}/>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                        }
                    </>
                    }
                    <BackToTop id="top"/>
                    {publishedProviderResults.totalResults > 0 &&
                    <>
                        <nav className="govuk-!-margin-top-5 govuk-!-margin-bottom-9" role="navigation"
                             aria-label="Pagination">
                            <div
                                className="pagination__summary">Showing {publishedProviderResults.startItemNumber} - {publishedProviderResults.endItemNumber} of {publishedProviderResults.totalResults} results
                            </div>
                            <Pagination callback={pageChange}
                                        currentPage={publishedProviderResults.pagerState.currentPage}
                                        lastPage={publishedProviderResults.pagerState.lastPage}/>
                        </nav>
                        <div className="right-align">
                            <button className="govuk-button govuk-!-margin-right-1"
                                    disabled={!userPermissions.canRefreshFunding}
                                    onClick={handleRefreshFunding}>Refresh funding
                            </button>
                            <button className="govuk-button govuk-!-margin-right-1"
                                    disabled={!publishedProviderResults.canApprove || !userPermissions.canApproveFunding}
                                    onClick={handleApprove}>Approve funding
                            </button>
                            <button className="govuk-button govuk-button--warning"
                                    disabled={!publishedProviderResults.canPublish || !userPermissions.canReleaseFunding}
                                    onClick={handleRelease}>Release funding
                            </button>
                            {latestJob && latestJob.lastUpdated &&
                            <p className="govuk-body">Last refresh on: <DateFormatter date={latestJob.lastUpdated} utc={false}/></p>}
                        </div>
                    </>
                    }
                </div>
            </div>
            }

            {!isJobRunning && !isConfirmingApproval && !isConfirmingRelease && !isLoadingResults && !haveResults &&
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <div className="govuk-warning-text">
                        <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                        <strong className="govuk-warning-text__text">
                            <span className="govuk-warning-text__assistive">Warning</span>
                            No providers are available for the selected specification
                        </strong>
                        <Link to={"/ViewFunding"} className="govuk-back-link govuk-!-margin-top-7">Back</Link>
                    </div>
                </div>
            </div>
            }

            {!isLoadingResults && isConfirmingApproval && !isConfirmingRelease && specificationSummary &&
            <div className="govuk-grid-row govuk-!-margin-left-1 govuk-!-margin-right-1">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <BackButton name="Back" callback={handleBack}/>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <table className="govuk-table">
                            <caption className="govuk-table__caption">You have selected:</caption>
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th className="govuk-table__header">Item</th>
                                <th className="govuk-table__header">Total</th>
                            </tr>
                            </thead>
                            <tbody className="govuk-table__body">
                            <tr className="govuk-table__row">
                                <td className="govuk-table__header">Number of providers to approve</td>
                                <td className="govuk-table__cell">{publishedProviderResults.totalProvidersToApprove}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <table className="govuk-table">
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th className="govuk-table__header">Specification Details</th>
                                <th className="govuk-table__header">Info</th>
                                <th className="govuk-table__header">Funding</th>
                            </tr>
                            </thead>
                            <tbody className="govuk-table__body">
                            <tr className="govuk-table__row">
                                <td className="govuk-table__cell">Funding Period</td>
                                <td className="govuk-table__cell">{specificationSummary.fundingPeriod.name}</td>
                                <td className="govuk-table__cell"></td>
                            </tr>
                            <tr>
                                <td className="govuk-table__cell">Specification selected</td>
                                <td className="govuk-table__cell">{specificationSummary.name}</td>
                                <td className="govuk-table__cell"></td>
                            </tr>
                            <tr>
                                <td className="govuk-table__cell">Funding Stream</td>
                                <td className="govuk-table__cell">{specificationSummary.fundingStreams.map(stream =>
                                    stream.name
                                )}</td>
                                <td className="govuk-table__cell"></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <table className="govuk-table">
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th className="govuk-table__header">Total funding being approved</th>
                                <th className="govuk-table__header"></th>
                                <th className="govuk-table__header">
                                    <FormattedNumber
                                        value={publishedProviderResults.totalFundingAmount}
                                        type={NumberType.FormattedMoney} decimalPoint={2}/>
                                </th>
                            </tr>
                            </thead>
                        </table>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <button data-prevent-double-click="true"
                                className="govuk-button govuk-!-margin-right-1"
                                data-module="govuk-button"
                                onClick={handleConfirmApprove}>
                            Confirm approval
                        </button>
                        <button className="govuk-button govuk-button--secondary"
                                data-module="govuk-button"
                                onClick={handleBack}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
            }

            {!isLoadingResults && isConfirmingRelease && specificationSummary &&
            <div className="govuk-grid-row govuk-!-margin-left-1 govuk-!-margin-right-1">
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <BackButton name="Back" callback={handleBack}/>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <table className="govuk-table">
                            <caption className="govuk-table__caption">You have selected:</caption>
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th className="govuk-table__header">Item</th>
                                <th className="govuk-table__header">Total</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="govuk-table__row">
                                <td className="govuk-table__header">Number of providers to release</td>
                                <td className="govuk-table__cell">{publishedProviderResults.totalProvidersToPublish}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <table className="govuk-table">
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th className="govuk-table__header">Specification Details</th>
                                <th className="govuk-table__header">Info</th>
                                <th className="govuk-table__header">Funding</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="govuk-table__row">
                                <td className="govuk-table__header">Funding Period</td>
                                <td className="govuk-table__cell">{specificationSummary.fundingPeriod.name}</td>
                                <td className="govuk-table__cell"></td>
                            </tr>
                            <tr className="govuk-table__row">
                                <td className="govuk-table__header">Specification selected</td>
                                <td className="govuk-table__cell">{specificationSummary.name}</td>
                                <td className="govuk-table__cell"></td>
                            </tr>
                            <tr className="govuk-table__row">
                                <td className="govuk-table__header">Funding Stream</td>
                                <td className="govuk-table__cell">{specificationSummary.fundingStreams.map(stream => stream.name)}</td>
                                <td className="govuk-table__cell"></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <table className="govuk-table">
                            <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th className="govuk-table__head">Total funding being released</th>
                                <th className="govuk-table__head"></th>
                                <th className="govuk-table__head">
                                    <FormattedNumber
                                        value={publishedProviderResults.totalFundingAmount}
                                        type={NumberType.FormattedMoney} decimalPoint={2}/>
                                </th>
                            </tr>
                            </thead>
                        </table>
                    </div>
                </div>
                {!isLoadingResults && haveResults &&
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <button data-prevent-double-click="true"
                                className="govuk-button govuk-!-margin-right-1"
                                data-module="govuk-button"
                                onClick={handleConfirmRelease}>
                            Confirm release
                        </button>
                        <button className="govuk-button govuk-button--secondary"
                                data-module="govuk-button"
                                onClick={handleBack}>
                            Cancel
                        </button>
                    </div>
                </div>
                }
            </div>
            }
        </div>
        <Footer/>
    </div>
}