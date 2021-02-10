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
import {useErrors} from "../../hooks/useErrors";
import {JobNotificationBanner} from "../../components/Jobs/JobNotificationBanner";
import {initialiseFundingSearchSelection} from "../../actions/FundingSearchSelectionActions";
import {FundingActionType} from "../../types/PublishedProvider/PublishedProviderFundingCount";
import * as publishService from "../../services/publishService";
import {ConfirmationModal} from "../../components/ConfirmationModal";
import {RunningStatus} from "../../types/RunningStatus";
import {AxiosError} from "axios";

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
    const {canApproveFunding, canRefreshFunding, canReleaseFunding, missingPermissions} =
        useSpecificationPermissions(specificationId, [SpecificationPermissions.Refresh, SpecificationPermissions.Approve, SpecificationPermissions.Release]);
    const [isLoadingRefresh, setIsLoadingRefresh] = useState<boolean>(false);
    const [jobId, setJobId] = useState<string>("");
    const {errors, addErrorMessage, addError, addValidationErrors, clearErrorMessages} = useErrors();
    const dispatch = useDispatch();
    const history = useHistory();


    useEffect(() => {
        if (!isSearchCriteriaInitialised) {
            dispatch(initialiseFundingSearchSelection(match.params.fundingStreamId, match.params.fundingPeriodId, match.params.specificationId));
        }
    }, [match, isSearchCriteriaInitialised]);
    

    async function handleApprove() {
        if (publishedProviderSearchResults && canApproveFunding && publishedProviderSearchResults.canApprove) {
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
        if (publishedProviderSearchResults && publishedProviderSearchResults.canPublish && canReleaseFunding) {
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
            const axiosError = error as AxiosError;
            if (axiosError && axiosError.response && axiosError.response.status === 400) {
                addValidationErrors({validationErrors: axiosError.response.data, message: "Error trying to refresh funding"});
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

    if (publishedProvidersWithErrors) {
        publishedProvidersWithErrors.forEach(err => addErrorMessage(err, "Provider error"));
    }

    if (latestJob && latestJob.jobId === jobId && latestJob.runningStatus === RunningStatus.Completed) {
        setIsLoadingRefresh(false);
        setJobId("");
        refetchSearchResults();
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

                {!isCheckingForJob && (latestJob && latestJob.isComplete) &&
                <JobNotificationBanner
                    job={latestJob}
                    isCheckingForJob={isCheckingForJob}/>
                }

                <SpecificationSummarySection
                    specification={specification}
                    isLoadingSpecification={isLoadingSpecification}
                />

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-one-third" hidden={(latestJob && latestJob.isActive) || isCheckingForJob || isLoadingRefresh}>
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
                        {!isCheckingForJob && !(latestJob && latestJob.isActive) && !isLoadingRefresh && !isLoadingSearchResults &&
                        !isLoadingSpecification && specification &&
                        <PublishedProviderResults
                            specificationId={specificationId}
                            fundingStreamId={fundingStreamId}
                            fundingPeriodId={fundingPeriodId}
                            specCoreProviderVersionId={specification.providerVersionId}
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
                </div>

                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full right-align">
                        <div className="right-align">
                            <button className="govuk-button govuk-!-margin-right-1"
                                    disabled={(latestJob && latestJob.isActive) || !canRefreshFunding || isLoadingRefresh}
                                    onClick={handleRefresh}>Refresh funding
                            </button>
                            <button className="govuk-button"
                                    disabled={(latestJob && latestJob.isActive) || !publishedProviderSearchResults?.canApprove || !canApproveFunding || isLoadingRefresh || isLoadingPublishedProviderErrors}
                                    onClick={handleApprove}>Approve funding
                            </button>
                            <button className="govuk-button govuk-button--warning govuk-!-margin-right-1"
                                    disabled={(latestJob && latestJob.isActive) || !publishedProviderSearchResults?.canPublish || !canReleaseFunding || isLoadingRefresh || isLoadingPublishedProviderErrors}
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