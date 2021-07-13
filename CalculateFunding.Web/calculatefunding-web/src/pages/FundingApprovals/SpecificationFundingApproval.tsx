import {RouteComponentProps, useHistory} from "react-router";
import React, {useEffect, useMemo, useState} from "react";
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
import {useSpecificationPermissions} from "../../hooks/Permissions/useSpecificationPermissions";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {usePublishedProviderSearch} from "../../hooks/FundingApproval/usePublishedProviderSearch";
import {useFundingConfiguration} from "../../hooks/useFundingConfiguration";
import {usePublishedProviderErrorSearch} from "../../hooks/FundingApproval/usePublishedProviderErrorSearch";
import {useErrors} from "../../hooks/useErrors";
import {JobNotificationBanner} from "../../components/Jobs/JobNotificationBanner";
import {initialiseFundingSearchSelection} from "../../actions/FundingSearchSelectionActions";
import {FundingActionType} from "../../types/PublishedProvider/PublishedProviderFundingCount";
import * as publishService from "../../services/publishService";
import {ConfirmationModal} from "../../components/ConfirmationModal";
import {AxiosError} from "axios";
import {Link} from "react-router-dom";
import {useQuery} from "react-query";
import {JobDetails} from "../../types/jobDetails";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";
import {getLatestSuccessfulJob} from "../../services/jobService";
import {DateTimeFormatter} from "../../components/DateTimeFormatter";
import {Permission} from "../../types/Permission";

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
    const isSearchCriteriaInitialised = state.searchCriteria !== undefined && state.searchCriteria.specificationId === specificationId;
    const {latestJob, isCheckingForJob} =
        useLatestSpecificationJobWithMonitoring(
            specificationId,
            [JobType.RefreshFundingJob,
                JobType.ApproveAllProviderFundingJob,
                JobType.ApproveBatchProviderFundingJob,
                JobType.PublishBatchProviderFundingJob,
                JobType.PublishAllProviderFundingJob],
            err => addError({error: err, description: "Error while checking for job"}));
    const {specification, isLoadingSpecification} =
        useSpecificationSummary(specificationId, err => addErrorMessage(err.message, "Error while loading specification"));
    const {fundingConfiguration, isLoadingFundingConfiguration} =
        useFundingConfiguration(fundingStreamId, fundingPeriodId,
            err => addErrorMessage(err.message, "", "Error while loading funding configuration"));
    const {publishedProviderSearchResults, publishedProviderIds, isLoadingSearchResults, refetchSearchResults} =
        usePublishedProviderSearch(state.searchCriteria, fundingConfiguration && fundingConfiguration.approvalMode,
            {
                onError: err => addError({error: err, description: "Error while searching for providers"}),
                enabled: (isSearchCriteriaInitialised &&
                    state.searchCriteria && state.searchCriteria.fundingStreamId && state.searchCriteria.fundingPeriodId) !== undefined
            });
    const {publishedProvidersWithErrors, isLoadingPublishedProviderErrors} =
        usePublishedProviderErrorSearch(specificationId, !isCheckingForJob && !(latestJob && latestJob.isActive),
            err => addErrorMessage(err.message, "Error while loading provider funding errors"));
    const {missingPermissions, hasPermission, isPermissionsFetched} =
        useSpecificationPermissions(match.params.specificationId, [Permission.CanRefreshFunding, Permission.CanApproveFunding, Permission.CanReleaseFunding]);
    useQuery<JobDetails | undefined, AxiosError>(`last-spec-${specificationId}-refresh`,
        async () => getJobDetailsFromJobResponse((await getLatestSuccessfulJob(specificationId, JobType.RefreshFundingJob)).data),
        {
            cacheTime: 0,
            refetchOnWindowFocus: false,
            enabled: specificationId !== undefined && specificationId.length > 0,
            onSettled: data => setLastRefresh(data?.lastUpdated),
            onError: err => addError({error: err, description: "Error while loading last refresh date"})
        });
    const [isLoadingRefresh, setIsLoadingRefresh] = useState<boolean>(false);
    const [jobId, setJobId] = useState<string>("");
    const [lastRefresh, setLastRefresh] = useState<Date | undefined>();
    const {errors, addErrorMessage, addError, addValidationErrors, clearErrorMessages} = useErrors();
    const hasPermissionToRefresh = useMemo(() => hasPermission && hasPermission(Permission.CanRefreshFunding), [isPermissionsFetched]);
    const hasPermissionToApprove = useMemo(() => hasPermission && hasPermission(Permission.CanApproveFunding), [isPermissionsFetched]);
    const hasPermissionToRelease = useMemo(() => hasPermission && hasPermission(Permission.CanReleaseFunding), [isPermissionsFetched]);
    const dispatch = useDispatch();
    const history = useHistory();


    useEffect(() => {
        if (!isSearchCriteriaInitialised) {
            dispatch(initialiseFundingSearchSelection(match.params.fundingStreamId, match.params.fundingPeriodId, match.params.specificationId));
        }
    }, [match, isSearchCriteriaInitialised]);

    useEffect(() => {
        if (!latestJob || !latestJob.isComplete) return;

        if (latestJob.jobType === JobType.RefreshFundingJob) {
            setIsLoadingRefresh(false);
            setLastRefresh(latestJob?.lastUpdated);
        }
        if (jobId !== "" && latestJob.jobId === jobId) {
            setIsLoadingRefresh(false);
            setJobId("");
            refetchSearchResults();
        }
    }, [latestJob, jobId]);

    async function handleApprove() {
        if (publishedProviderSearchResults && hasPermissionToApprove && publishedProviderSearchResults.canApprove) {
            if (fundingConfiguration?.approvalMode === ApprovalMode.All && publishedProvidersWithErrors && publishedProvidersWithErrors.length > 0) {
                addErrorMessage("Funding cannot be approved as there are providers in error",
                    undefined,
                    undefined,
                    "Please filter by error status to identify affected providers"
                );
            } else {
                history.push(`/Approvals/ConfirmFunding/${fundingStreamId}/${fundingPeriodId}/${specificationId}/${FundingActionType.Approve}`);
            }
        }
    }

    async function handleRelease() {
        if (publishedProviderSearchResults && publishedProviderSearchResults.canPublish && hasPermissionToRelease) {
            if (fundingConfiguration?.approvalMode === ApprovalMode.All && publishedProvidersWithErrors && publishedProvidersWithErrors.length > 0) {
                addErrorMessage("Funding cannot be released as there are providers in error",
                    undefined,
                    undefined,
                    "Please filter by error status to identify affected providers"
                );
            } else {
                history.push(`/Approvals/ConfirmFunding/${fundingStreamId}/${fundingPeriodId}/${specificationId}/${FundingActionType.Release}`);
            }
        }
    }

    async function handleRefresh() {
        clearErrorMessages();

        try {
            setIsLoadingRefresh(true);
            await publishService.preValidateForRefreshFundingService(specificationId);
            setIsLoadingRefresh(false);

            ConfirmationModal(<ConfirmRefreshModelBody/>, refreshFunding, "Confirm", "Cancel");
        } catch (error) {
            window.scrollTo(0, 0);
            const axiosError = error as AxiosError;
            if (axiosError && axiosError.response && axiosError.response.status === 400) {
                addValidationErrors({
                    validationErrors: axiosError.response.data,
                    message: "Error trying to refresh funding"
                });
            } else {
                addError({error: error, description: `Error trying to refresh funding`});
            }
        }
        setIsLoadingRefresh(false);
    }

    async function refreshFunding() {
        setIsLoadingRefresh(true);
        try {
            setJobId((await publishService.refreshSpecificationFundingService(specificationId)).data);
        } catch (e) {
            addErrorMessage(e, "Error trying to refresh funding");
        } finally {
            setIsLoadingRefresh(false);
        }
    }

    const ConfirmRefreshModelBody = () => {
        return <div className="govuk-grid-column-full left-align">
            <h1 className="govuk-heading-l">Confirm funding refresh</h1>
            <p className="govuk-body">A refresh of funding will update the following data:</p>
            <ul className="govuk-list govuk-list--bullet">
                <li>Allocation values</li>
                <li>Profile values</li>
            </ul>
            <p className="govuk-body">
                This update will affect providers in specification {specification?.name} for the funding
                stream {specification?.fundingStreams[0].name} and period {specification?.fundingPeriod.name}.
            </p>
        </div>
    }

    const clearFundingSearchSelection = () => {
        dispatch(initialiseFundingSearchSelection(fundingStreamId, fundingPeriodId, specificationId));
    }

    if (publishedProvidersWithErrors) {
        publishedProvidersWithErrors.forEach(err => addErrorMessage(err, "Provider error"));
    }

    const isLoading = errors.length === 0 &&
        (!isSearchCriteriaInitialised ||
            isLoadingSpecification ||
            isLoadingFundingConfiguration ||
            isCheckingForJob ||
            (latestJob && latestJob.isActive) ||
            isLoadingSearchResults ||
            isLoadingRefresh);
    const loadingTitle =
        isLoadingSpecification ? "Loading specification..." :
            isLoadingRefresh ? "Requesting refresh of funding..." :
                isCheckingForJob ? "Checking for jobs..." :
                    (latestJob && latestJob.isActive) ? `Job ${latestJob.statusDescription}: ${latestJob.jobDescription}` :
                        isLoadingSearchResults ? "Loading provider funding data..." :
                            isLoadingFundingConfiguration ? "Loading funding configuration..." :
                                ""
    const loadingSubtitle =
        isLoadingRefresh ? "Updating, please wait" :
            isCheckingForJob ? "Searching for any running jobs" :
                (latestJob && latestJob.isActive) ? "Monitoring job progress. Please wait, this could take several minutes" :
                    "";

    const haveAnyProviderErrors = isLoadingPublishedProviderErrors ||
        (publishedProvidersWithErrors && publishedProvidersWithErrors.length > 0);

    const blockActionBasedOnProviderErrors = fundingConfiguration?.approvalMode === ApprovalMode.All && haveAnyProviderErrors;

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

                <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched}/>

                <MultipleErrorSummary errors={errors} specificationId={specificationId}/>

                {!isCheckingForJob && (latestJob && latestJob.isComplete) &&
                <JobNotificationBanner
                    job={latestJob}
                    isCheckingForJob={isCheckingForJob}/>
                }

                {!isLoadingSpecification && specification &&
                <div className="govuk-grid-row govuk-!-margin-bottom-5">
                    <div className="govuk-grid-column-two-thirds">
                        <h1 className="govuk-heading-xl govuk-!-margin-bottom-1" data-testid="specName">
                            {specification.name}
                        </h1>
                        {specification?.fundingStreams?.length > 0 && specification?.fundingPeriod?.name &&
                            <span className="govuk-caption-l"
                                  data-testid="fundingDetails">
                                {specification.fundingStreams[0].name} {' '}
                                for {specification && specification.fundingPeriod.name}
                            </span>
                        }
                    </div>
                    <div className="govuk-grid-column-one-third">
                        <ul className="govuk-list right-align">
                            {fundingConfiguration && fundingConfiguration.approvalMode === ApprovalMode.Batches &&
                            <li>
                                <Link className="govuk-link govuk-link--no-visited-state"
                                      to={`/Approvals/UploadBatch/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}>
                                    Upload batch file of providers
                                </Link>
                            </li>
                            }
                            <li>
                                <Link className="govuk-link govuk-link--no-visited-state"
                                      to={`/ViewSpecificationResults/${specificationId}?initialTab=downloadable-reports`}>
                                    Specification reports
                                </Link>
                            </li>
                            <li>
                                <button className="govuk-link govuk-!-margin-right-1 govuk-link--no-visited-state"
                                        disabled={(latestJob && latestJob.isActive) || !hasPermissionToRefresh || isLoadingRefresh}
                                        onClick={handleRefresh}>
                                    Refresh funding
                                </button>
                            </li>
                            {lastRefresh &&
                            <p className="govuk-body-s govuk-!-margin-bottom-0">
                                Last refresh <DateTimeFormatter date={lastRefresh as Date}/>
                            </p>
                            }
                        </ul>
                    </div>
                </div>
                }

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-third"
                         hidden={(latestJob && latestJob.isActive) || isCheckingForJob || isLoadingRefresh}>
                        <PublishedProviderSearchFilters
                            facets={publishedProviderSearchResults ? publishedProviderSearchResults.facets : []}
                            numberOfProvidersWithErrors={0}
                            clearFundingSearchSelection={clearFundingSearchSelection}
                        />
                    </div>
                    <div className="govuk-grid-column-two-thirds">
                        {isLoading &&
                        <div>
                            <LoadingStatus title={loadingTitle} subTitle={loadingSubtitle}/>
                        </div>
                        }
                        {!isCheckingForJob && !(latestJob && latestJob.isActive) && !isLoadingRefresh && !isLoadingSearchResults &&
                        !isLoadingSpecification && specification &&
                        <PublishedProviderResults
                            specificationId={specificationId}
                            fundingStreamId={fundingStreamId}
                            fundingPeriodId={fundingPeriodId}
                            specCoreProviderVersionId={specification.providerVersionId}
                            enableBatchSelection={fundingConfiguration?.approvalMode === ApprovalMode.Batches}
                            providerSearchResults={publishedProviderSearchResults}
                            canRefreshFunding={hasPermissionToRefresh}
                            canApproveFunding={hasPermissionToApprove}
                            canReleaseFunding={hasPermissionToRelease}
                            totalResults={publishedProviderIds ? publishedProviderIds.length : publishedProviderSearchResults ? publishedProviderSearchResults.totalResults : 0}
                            allPublishedProviderIds={publishedProviderIds}
                            setIsLoadingRefresh={setIsLoadingRefresh}
                            addError={addErrorMessage}
                            clearErrorMessages={clearErrorMessages}
                        />
                        }
                    </div>
                </div>

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full right-align">
                        <div className="right-align">
                            <button className="govuk-button govuk-!-margin-right-1"
                                    disabled={(latestJob && latestJob.isActive) || !hasPermissionToRefresh || isLoadingRefresh}
                                    onClick={handleRefresh}>Refresh funding
                            </button>
                            <button className="govuk-button"
                                    disabled={(latestJob && latestJob.isActive) ||
                                    !publishedProviderSearchResults?.canApprove ||
                                    !hasPermissionToApprove ||
                                    isLoadingRefresh ||
                                    blockActionBasedOnProviderErrors}
                                    onClick={handleApprove}>Approve funding
                            </button>
                            <button className="govuk-button govuk-button--warning govuk-!-margin-right-1"
                                    disabled={(latestJob && latestJob.isActive) ||
                                    !publishedProviderSearchResults?.canPublish ||
                                    !hasPermissionToRelease ||
                                    isLoadingRefresh ||
                                    blockActionBasedOnProviderErrors}
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
