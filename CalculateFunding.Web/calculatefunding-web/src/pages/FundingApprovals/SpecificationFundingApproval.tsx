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
import {preValidateForRefreshFundingService, refreshSpecificationFundingService} from "../../services/publishService";
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
    const {latestJob, isCheckingForJob} =
        useLatestSpecificationJobWithMonitoring(
            specificationId,
            [JobType.RefreshFundingJob,
                JobType.ApproveAllProviderFundingJob,
                JobType.ApproveBatchProviderFundingJob,
                JobType.PublishBatchProviderFundingJob,
                JobType.PublishAllProviderFundingJob],
            err => addError(err, "Error while checking for job"));
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
            !isCheckingForJob && !(latestJob && latestJob.isActive) && fundingConfiguration !== undefined && fundingConfiguration.approvalMode === ApprovalMode.Batches,
            err => addErrorMessage(err.message, "", "Error while loading provider ids"));
    const {publishedProvidersWithErrors} =
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

        try {
            setIsLoadingRefresh(true);
            await preValidateForRefreshFundingService(specificationId);
            setIsLoadingRefresh(false);

            ConfirmationModal(<ConfirmRefreshModelBody/>, refreshFunding, "Confirm", "Cancel");
        } catch (e) {
            if (e.isAxiosError) {
                const axiosError = e as AxiosError;
                if (axiosError.response) {
                    addValidationErrors(axiosError.response.data, "Error trying to refresh funding");
                }
            } else {
                addErrorMessage(e, "Error trying to refresh funding");
            }
            setIsLoadingRefresh(false);
        }
    }

    async function refreshFunding() {
        setIsLoadingRefresh(true);
        try {
            setJobId((await refreshSpecificationFundingService(specificationId)).data.jobId);
        } catch (e) {
            setIsLoadingRefresh(false);
            addErrorMessage(e, "Error trying to refresh funding");
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
    }

    const isLoading = errors.length === 0 && (isLoadingSpecification || isLoadingFundingConfiguration || isCheckingForJob || (latestJob && latestJob.isActive) || isLoadingSearchResults || isLoadingPublishedProviderIds || isLoadingRefresh);
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
                        !isLoadingPublishedProviderIds && !isLoadingSpecification && specification &&
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
                                    disabled={(latestJob && latestJob.isActive) || !publishedProviderSearchResults?.canApprove || !canApproveFunding || isLoadingRefresh}
                                    onClick={handleApprove}>Approve funding
                            </button>
                            <button className="govuk-button govuk-button--warning govuk-!-margin-right-1"
                                    disabled={(latestJob && latestJob.isActive) || !publishedProviderSearchResults?.canPublish || !canReleaseFunding || isLoadingRefresh}
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