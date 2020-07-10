import {RouteComponentProps} from "react-router";
import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {getPublishedProviderResultsService} from "../../services/publishedProviderService";
import {useEffectOnce} from "../../hooks/useEffectOnce";
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
import {getLastUpdateJobForSpecificationService, getLatestJobForSpecificationService} from "../../services/jobService";
import {Link} from "react-router-dom";
import {approveFundingService, refreshFundingService, releaseFundingService} from "../../services/publishService";
import {getUserPermissionsService} from "../../services/userService";
import {EffectiveSpecificationPermission} from "../../types/EffectiveSpecificationPermission";
import {JobMessage} from "../../types/jobMessage";
import {BackButton} from "../../components/BackButton";
import {NotificationSignal} from "../../signals/NotificationSignal";
import {PermissionStatus} from "../../components/PermissionStatus";
import {NoData} from "../../components/NoData";
import {FacetValue} from "../../types/Facet";

export interface FundingApprovalResultsRoute {
    fundingStreamId: string;
    fundingPeriodId: string;
    specificationId: string;
}

export function FundingApprovalResults({match}: RouteComponentProps<FundingApprovalResultsRoute>) {
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const specificationId = match.params.specificationId;
    const jobTypes = "RefreshFundingJob,ApproveFundingJob,PublishProviderFundingJob,ApproveFunding";

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
        localAuthority: [],
        fundingStreamId: fundingStreamId,
        searchMode: SearchMode.All,
        pageSize: 50,
        pageNumber: 1,
        includeFacets: true,
        facetCount: 0,
        fundingPeriodId: fundingPeriodId,
        errorToggle: ""
    }
    const [specificationSummary, setSpecificationSummary] = useState<SpecificationSummary>({

        fundingStreams: [{
            id: "",
            name: ""
        }],
        fundingPeriod: {
            name: "",
            id: ""
        },
        name: "",
        approvalStatus: "",
        description: "",
        isSelectedForFunding: false,
        providerVersionId: "",
        id: ""
    });
    const [latestRefresh, setLatestRefresh] = useState<string>("Unknown");
    const [latestJob, setLatestJob] = useState<JobMessage>({
        completionStatus: null,
        invokerUserDisplayName: "",
        invokerUserId: "",
        itemCount: 0,
        jobId: "",
        jobType: "",
        outcome: undefined,
        overallItemsFailed: 0,
        overallItemsProcessed: 0,
        overallItemsSucceeded: 0,
        parentJobId: 0,
        runningStatus: "",
        specificationId: "",
        statusDateTime: "",
        supersededByJobId: 0
    });

    const [tableIsLoading, setTableIsLoading] = useState<boolean>(true);

    const [searchCriteria, setSearchCriteria] = useState<SearchRequestViewModel>(initialSearch);
    const [filterStatus, setFilterStatus] = useState<FacetValue[]>([])
    const [filterProviderType, setFilterProviderType] = useState<FacetValue[]>([])
    const [filterLocalAuthority, setFilterLocalAuthority] = useState<FacetValue[]>([])

    const [pageState, setPageState] = useState<string>("IDLE");
    const [jobState, setJobState] = useState({jobStatus: "", jobMessage: "", jobSuggestion: ""});
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

    useEffect(() => {
        getPublishedProviderResults(searchCriteria);
    }, [searchCriteria]);

    useEffectOnce(() => {
        getUserPermissions();
        getPublishedProviderResults(initialSearch);

        getSpecificationSummaryService(specificationId).then((result) => {
            setSpecificationSummary(result.data as SpecificationSummary);
        });

        getLastUpdateJobForSpecificationService(specificationId).then((result) => {
            if (result.status === 200) {
                setLatestRefresh(result.data);
            }
        });

        getLatestJobForSpecificationService(specificationId, jobTypes).then((result) => {
            if (result.status === 200) {
                setLatestJob(result.data as JobMessage);
            }
        });
    });

    function getPublishedProviderResults(searchRequestViewModel: SearchRequestViewModel) {
        getPublishedProviderResultsService(searchRequestViewModel).then((result) => {
            const response = result.data as PublishProviderSearchResultViewModel;
            setPublishedProviderResults(result.data as PublishProviderSearchResultViewModel)
            setFilterProviderType(response.facets[0].facetValues);
            setFilterLocalAuthority(response.facets[1].facetValues)
            setFilterStatus(response.facets[2].facetValues)
            setTableIsLoading(false);
        });
    }

    function pageChange(pageNumber: string) {
        setSearchCriteria(prevState => {
            return {...prevState, pageNumber: parseInt(pageNumber)}
        });
    }

    function populatePublishedProviderResultsService(criteria: SearchRequestViewModel) {
        setTableIsLoading(true);
        getPublishedProviderResultsService(criteria).then((result) => {
            setPublishedProviderResults(result.data as PublishProviderSearchResultViewModel)
            setTableIsLoading(false);
        })
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

        let request = searchCriteria;
        request.localAuthority = filterUpdate;

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

        let request = searchCriteria;
        request.status = filterUpdate;

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

        let request = searchCriteria;
        request.providerType = filterUpdate;

        populatePublishedProviderResultsService(searchCriteria);
    }

    function filterByText(e: React.ChangeEvent<HTMLInputElement>) {
        const term = e.target.value;

        if ((term.length === 0 && searchCriteria.searchTerm.length !== 0) || term.length > 2) {
            let request = searchCriteria;
            request.searchTerm = term;
            request.pageNumber = 1;
            setSearchCriteria(prevState => {
                return {...prevState, searchTerm: term, pageNumber: 1}
            })
            populatePublishedProviderResultsService(request);
        }
    }

    function refreshFunding() {
        setPageState("REFRESH_FUNDING");
        refreshFundingService(specificationId)
    };

    function approveFunding() {
        setPageState("APPROVE_FUNDING");
    };

    function releaseFunding() {
        setPageState("PUBLISH_FUNDING");
    };

    function confirmApproveFunding() {
        setPageState("APPROVE_FUNDING_JOB");
        approveFundingService(specificationId);
    };

    function confirmReleaseFunding() {
        setPageState("RELEASE_FUNDING_JOB");
        releaseFundingService(specificationId);
    };

    function refreshProviderResults(status: string, message: string, suggestion: string) {
        setSearchCriteria(initialSearch);
        populatePublishedProviderResultsService(initialSearch);
        setPageState("IDLE");
        setJobState({jobStatus: status, jobMessage: message, jobSuggestion: suggestion})
    };

    function dismissLoader() {
        setPageState("IDLE");
    };

    function getUserPermissions() {
        getUserPermissionsService(specificationId).then((result) => {
            const specificationPermissions = result.data as EffectiveSpecificationPermission;
            setUserPermissions(specificationPermissions);
            if (!specificationPermissions.canApproveFunding) {
                if (!missingPermissions.find(x => x === "approve")) {
                    setMissingPermissions(prevState => [...prevState, "approve"]);
                }
            }
            if (!specificationPermissions.canReleaseFunding) {
                if (!missingPermissions.find(x => x === "release")) {
                    setMissingPermissions(prevState => [...prevState, "release"]);
                }
            }
            if (!specificationPermissions.canRefreshFunding) {
                if (!missingPermissions.find(x => x === "refresh")) {
                    setMissingPermissions(prevState => [...prevState, "refresh"]);
                }
            }
        });
    }

    return <div>
        <Header location={Section.Approvals}/>
        <div className="govuk-width-container">
            <Breadcrumbs>
                <Breadcrumb name={"Calculate funding"} url={"/"}/>
                <Breadcrumb name={"Funding approvals"} url={"/Approvals"}/>
                <Breadcrumb name={"Select specification"} url={"/ViewFunding"}/>
                <Breadcrumb name={"Funding approval results"}/>
            </Breadcrumbs>
            <PermissionStatus requiredPermissions={missingPermissions}/>
            <LoadingStatus title={`${latestJob.jobType} of funding in progress`}
                           subTitle={"Please wait, this could take several minutes"}
                           hidden={latestJob.runningStatus === 'Completed' || latestJob.runningStatus === ''}/>
            <div className="govuk-grid-row govuk-!-margin-bottom-5"
                 hidden={pageState !== "IDLE" || (latestJob.runningStatus !== 'Completed' && latestJob.runningStatus !== '')}>
                <div className="govuk-grid-column-two-thirds">
                    <span className="govuk-caption-xl">Specification</span>
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{specificationSummary.name}</h1>
                    <span className="govuk-caption-m">Funding period</span>
                    <h1 className="govuk-heading-m">{specificationSummary.fundingPeriod.name}</h1>
                    <span className="govuk-caption-m">Funding stream</span>
                    <h1 className="govuk-heading-m">{specificationSummary.fundingStreams[0].name}</h1>
                </div>
            </div>
            <div className="govuk-grid-row "
                 hidden={pageState !== "IDLE" || (latestJob.runningStatus !== 'Completed' && latestJob.runningStatus !== '') ||
                 (publishedProviderResults.providers == null || publishedProviderResults.providers.length === 0)}>
                <div className="govuk-grid-column-one-third">
                    <CollapsiblePanel title={"Search"} expanded={true}>
                        <span className="govuk-body-s">Search by provider name, UPIN, UKPRN, URN, or establishment number</span>
                        <input id="searchByText" className="govuk-input" type="text" onChange={(e) => filterByText(e)}/>
                    </CollapsiblePanel>
                    <CollapsiblePanel title={"Filter by provider type"} expanded={true}>
                        <fieldset className="govuk-fieldset">
                            <div className="govuk-form-group">
                                <label className="govuk-label">Search</label>
                                {/*<input className="govuk-input" type="text"*/}
                                {/*       onChange={(e) => searchStatus(e)}/>*/}
                            </div>
                            <div className="govuk-checkboxes">
                                {filterProviderType.map((s, index) =>
                                    <div key={index} className="govuk-checkboxes__item">
                                        <input className="govuk-checkboxes__input"
                                               id={`providerType-${s.name}`}
                                               name={`providerType-${s.name}`}
                                               type="checkbox" value={s.name}
                                               onChange={(e) => filterByProviderType(e)}/>
                                        <label className="govuk-label govuk-checkboxes__label"
                                               htmlFor={`providerType-${s.name}`}>
                                            {s.name}
                                        </label>
                                    </div>)
                                }
                            </div>
                        </fieldset>
                    </CollapsiblePanel>
                    <CollapsiblePanel title={"Filter by status"} expanded={true}>
                        <fieldset className="govuk-fieldset">
                            <div className="govuk-checkboxes">
                                {filterStatus.map((s, index) =>
                                    <div key={index} className="govuk-checkboxes__item">
                                        <input className="govuk-checkboxes__input"
                                               id={`fundingPeriods-${s.name}`}
                                               name={`fundingPeriods-${s.name}`}
                                               type="checkbox" value={s.name}
                                               onChange={(e) => filterByStatus(e)}/>
                                        <label className="govuk-label govuk-checkboxes__label"
                                               htmlFor={`fundingPeriods-${s.name}`}>
                                            {s.name}
                                        </label>
                                    </div>)
                                }
                            </div>
                        </fieldset>
                    </CollapsiblePanel>
                    <CollapsiblePanel title={"Filter by local authority"} expanded={true}>
                        <fieldset className="govuk-fieldset">
                            <div className="govuk-checkboxes">
                                {filterLocalAuthority.map((s, index) =>
                                    <div key={index} className="govuk-checkboxes__item">
                                        <input className="govuk-checkboxes__input"
                                               id={`localAuthority-${s.name}`}
                                               name={`localAuthority-${s.name}`}
                                               type="checkbox" value={s.name}
                                               onChange={(e) => filterByLocalAuthority(e)}/>
                                        <label className="govuk-label govuk-checkboxes__label"
                                               htmlFor={`localAuthority-${s.name}`}>
                                            {s.name}
                                        </label>
                                    </div>)
                                }
                            </div>
                        </fieldset>
                    </CollapsiblePanel>
                </div>
                <div className="govuk-grid-column-two-thirds">
                    <LoadingStatus title={"Loading published provider data"} hidden={!tableIsLoading}/>
                    <NoData hidden={publishedProviderResults.providers.length > 0 && !tableIsLoading} />
                    <table className="govuk-table" hidden={tableIsLoading}>
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
                        {publishedProviderResults.providers.map(ppr =>
                            <tr key={ppr.id}>
                                <td className="govuk-table__cell govuk-body">
                                    <Link
                                        to={`/FundingApprovals/ProviderFundingOverview/${ppr.specificationId}/${ppr.ukprn}/${specificationSummary.providerVersionId}`}>{ppr.providerName}</Link>
                                </td>
                                <td className="govuk-table__cell govuk-body">{ppr.ukprn}</td>
                                <td className="govuk-table__cell govuk-body">{ppr.fundingStatus}</td>
                                <td className="govuk-table__cell govuk-body">
                                    <FormattedNumber value={ppr.fundingValue}
                                                     type={NumberType.FormattedMoney} decimalPoint={2}/>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    <BackToTop id="top"/>
                    <nav className="govuk-!-margin-top-5 govuk-!-margin-bottom-9" role="navigation"
                         aria-label="Pagination">
                        <div
                            className="pagination__summary">Showing {publishedProviderResults.startItemNumber} - {publishedProviderResults.endItemNumber} of {publishedProviderResults.totalResults} results
                        </div>
                        <Pagination callback={pageChange} currentPage={publishedProviderResults.pagerState.currentPage}
                                    lastPage={publishedProviderResults.pagerState.lastPage}/>
                    </nav>
                    <div className="right-align">
                        <button className="govuk-button govuk-!-margin-right-1"
                                disabled={!publishedProviderResults.canApprove || !userPermissions.canApproveFunding}
                                onClick={() => approveFunding()}>Approve
                        </button>
                        <button className="govuk-button govuk-!-margin-right-1"
                                disabled={!publishedProviderResults.canPublish || !userPermissions.canReleaseFunding}
                                onClick={() => releaseFunding()}>Release
                        </button>
                        <button className="govuk-button"
                                disabled={!userPermissions.canRefreshFunding}
                                onClick={() => refreshFunding()}>Refresh
                            funding
                        </button>
                        <p className="govuk-body">Last refresh on: {latestRefresh}</p>
                    </div>
                </div>
            </div>
            <div className="govuk-grid-row"
                 hidden={(publishedProviderResults.providers != null && publishedProviderResults.providers.length > 0) || tableIsLoading}>
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
            <div className="govuk-grid-row govuk-!-margin-left-1 govuk-!-margin-right-1"
                 hidden={pageState !== "REFRESH_FUNDING" || (latestJob.runningStatus !== 'Completed' && latestJob.runningStatus !== '')}>
                <BackButton name="Back" callback={dismissLoader}/>
                <NotificationSignal jobType="RefreshFundingJob"
                                    jobId={pageState === "REFRESH_FUNDING" ? specificationId : ""}
                                    message="Waiting to refresh funding"
                                    callback={refreshProviderResults}/>
            </div>

            <div className="govuk-grid-row govuk-!-margin-left-1 govuk-!-margin-right-1"
                 hidden={pageState !== "APPROVE_FUNDING" || (latestJob.runningStatus !== 'Completed' && latestJob.runningStatus !== '')}>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <BackButton name="Back" callback={dismissLoader}/>
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
                        <button className="govuk-button" data-module="govuk-button"
                                onClick={() => confirmApproveFunding()}>Confirm Approval
                        </button>
                    </div>
                </div>
            </div>

            <div className="govuk-grid-row govuk-!-margin-left-1 govuk-!-margin-right-1"
                 hidden={pageState !== "PUBLISH_FUNDING" || (latestJob.runningStatus !== 'Completed' && latestJob.runningStatus !== '')}>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <BackButton name="Back" callback={dismissLoader}/>
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
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <button className="govuk-button" data-module="govuk-button"
                                onClick={() => confirmReleaseFunding()}>Confirm Release
                        </button>

                    </div>
                </div>
            </div>

            <div className="govuk-grid-row govuk-!-margin-left-1 govuk-!-margin-right-1"
                 hidden={pageState !== "APPROVE_FUNDING_JOB" || (latestJob.runningStatus !== 'Completed' && latestJob.runningStatus !== '')}>
                <BackButton name="Back" callback={dismissLoader}/>
                <NotificationSignal jobType="ApproveFunding"
                                    jobId={pageState === "APPROVE_FUNDING_JOB" ? specificationId : ""}
                                    message="Waiting to approve funding"
                                    callback={refreshProviderResults}/>
            </div>

            <div className="govuk-grid-row govuk-!-margin-left-1 govuk-!-margin-right-1"
                 hidden={pageState !== "RELEASE_FUNDING_JOB" || (latestJob.runningStatus !== 'Completed' && latestJob.runningStatus !== '')}>
                <BackButton name="Back" callback={dismissLoader}/>
                <NotificationSignal jobType="PublishProviderFundingJob"
                                    jobId={pageState === "RELEASE_FUNDING_JOB" ? specificationId : ""}
                                    message="Waiting to release funding"
                                    callback={refreshProviderResults}/>
            </div>
        </div>
    </div>
}
