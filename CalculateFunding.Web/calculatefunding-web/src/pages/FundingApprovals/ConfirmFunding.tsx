import {RouteComponentProps, useHistory} from "react-router";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PermissionStatus} from "../../components/PermissionStatus";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useSpecificationPermissions} from "../../hooks/Permissions/useSpecificationPermissions";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {useFundingConfiguration} from "../../hooks/useFundingConfiguration";
import {useErrors} from "../../hooks/useErrors";
import {FundingActionType, PublishedProviderFundingCount} from "../../types/PublishedProvider/PublishedProviderFundingCount";
import {LoadingStatus} from "../../components/LoadingStatus";
import {JobNotificationBanner} from "../../components/Jobs/JobNotificationBanner";
import {Link} from "react-router-dom";
import * as publishService from "../../services/publishService";
import {ApprovalMode} from "../../types/ApprovalMode";
import {FundingSearchSelectionState} from "../../states/FundingSearchSelectionState";
import {useDispatch, useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {HistoryPage} from "../../types/HistoryPage";
import {initialiseFundingSearchSelection} from "../../actions/FundingSearchSelectionActions";
import {buildInitialPublishedProviderSearchRequest} from "../../types/publishedProviderSearchRequest";
import {FundingConfirmationSummary} from "../../components/Funding/FundingConfirmationSummary";
import {Footer} from "../../components/Footer";
import * as publishedProviderService from "../../services/publishedProviderService";
import {getSpecificationCalculationResultsMetadata} from "../../services/providerService";
import {Permission} from "../../types/Permission";
import {DateTimeFormatter} from "../../components/DateTimeFormatter";

export interface ConfirmFundingRouteProps {
    fundingStreamId: string,
    fundingPeriodId: string,
    specificationId: string,
    mode: FundingActionType
}

export function ConfirmFunding({match}: RouteComponentProps<ConfirmFundingRouteProps>) {
    const history = useHistory();
    const dispatch = useDispatch();

    const previousPage: HistoryPage =
        history?.location?.state &&
        (history.location.state as any) &&
        (history.location.state as any).previousPage as HistoryPage ?
            (history.location.state as any).previousPage :
            {
                title: "Funding approval results",
                path: `/Approvals/SpecificationFundingApproval/${match.params.fundingStreamId}/${match.params.fundingPeriodId}/${match.params.specificationId}`
            };
    const state: FundingSearchSelectionState = useSelector<IStoreState, FundingSearchSelectionState>(state => state.fundingSearchSelection);
    const {latestJob, isCheckingForJob} =
        useLatestSpecificationJobWithMonitoring(
            match.params.specificationId,
            [JobType.RefreshFundingJob,
                JobType.ApproveAllProviderFundingJob,
                JobType.ApproveBatchProviderFundingJob,
                JobType.PublishBatchProviderFundingJob,
                JobType.PublishAllProviderFundingJob],
            err => addError({error: err, description: "Error checking for job"}));
    const {specification, isLoadingSpecification} =
        useSpecificationSummary(match.params.specificationId,
            err => addError({error: err, description: `Error while loading specification`}));
    const {missingPermissions, hasPermission, isPermissionsFetched} =
        useSpecificationPermissions(match.params.specificationId, [Permission.CanApproveFunding, Permission.CanReleaseFunding]);
    const {fundingConfiguration, isLoadingFundingConfiguration} =
        useFundingConfiguration(match.params.fundingStreamId, match.params.fundingPeriodId,
            err => addError({error: err, description: `Error while loading funding configuration`}));
    const {errors, addError} = useErrors();
    const [fundingSummary, setFundingSummary] = useState<PublishedProviderFundingCount>();
    const [jobId, setJobId] = useState<string>("");
    const [isConfirming, setIsConfirming] = useState<boolean>(false);
    const isLoading = useMemo(() =>
        isConfirming ||
        specification === undefined ||
        fundingConfiguration === undefined || 
        !isPermissionsFetched, [specification, fundingConfiguration, isConfirming, isPermissionsFetched]);
    const isWaitingForJob = useMemo(() => isCheckingForJob || latestJob !== undefined && !latestJob.isComplete, [isCheckingForJob, latestJob]);
    const hasPermissionToApprove = useMemo(() => hasPermission && hasPermission(Permission.CanApproveFunding), [isPermissionsFetched]);
    const hasPermissionToRelease = useMemo(() => hasPermission && hasPermission(Permission.CanReleaseFunding), [isPermissionsFetched]);
    const [specificationLastUpdatedDate, setSpecificationLastUpdatedDate] = useState<Date>();
    useEffect(() => {
        getSpecificationCalculationResultsMetadata(match.params.specificationId).then((result) => {
            setSpecificationLastUpdatedDate(result.data.lastUpdated);
        }).catch((err) => {
            addError({
                error: err,
                description: `Error while getting specification calculation results metadata for specification Id: ${match.params.specificationId}`
            })
        });
    },[match.params.specificationId]);

    useEffect(() => {
        if (!fundingConfiguration || fundingSummary) return;

        async function loadBatchFundingSummary() {
            const response = match.params.mode === FundingActionType.Approve ?
                await publishService.getFundingSummaryForApprovingService(match.params.specificationId, state.selectedProviderIds) :
                await publishService.getFundingSummaryForReleasingService(match.params.specificationId, state.selectedProviderIds);
            setFundingSummary(response.data);
        }

        async function loadFullFundingSummary() {
            const search = buildInitialPublishedProviderSearchRequest(match.params.fundingStreamId, match.params.fundingPeriodId, match.params.specificationId);
            const publishedProviderSearchResults = (await publishedProviderService.searchForPublishedProviderResults(search)).data;
            const funding: PublishedProviderFundingCount = {
                count: match.params.mode === FundingActionType.Approve ? publishedProviderSearchResults.totalProvidersToApprove : publishedProviderSearchResults.totalProvidersToPublish,
                fundingStreamsFundings: [],
                localAuthorities: [],
                localAuthoritiesCount: 0,
                providerTypes: [],
                providerTypesCount: 0,
                totalFunding: publishedProviderSearchResults.totalFundingAmount
            }
            setFundingSummary(funding);
        }

        if (fundingConfiguration.approvalMode === ApprovalMode.All) {
            loadFullFundingSummary();
        }
        if (fundingConfiguration.approvalMode === ApprovalMode.Batches) {
            if (state.selectedProviderIds.length > 0) {
                loadBatchFundingSummary();
            }
            if (state.selectedProviderIds.length === 0) {
                addError({error: "There are selected providers to " + match.params.mode.toLowerCase()});
            }
        }
    }, [fundingConfiguration, match.params]);

    useEffect(() => {
        const handleActionJobComplete = () => {
            if (isConfirming && jobId && jobId.length > 0 && latestJob && latestJob.jobId === jobId) {
                setIsConfirming(false);
                if (latestJob.isComplete && latestJob.isSuccessful) {
                    clearFundingSearchSelection();
                    history.push(`/Approvals/SpecificationFundingApproval/${match.params.fundingStreamId}/${match.params.fundingPeriodId}/${match.params.specificationId}`);
                }
            }
        };

        handleActionJobComplete()
    }, [latestJob?.jobId, jobId]);

    const clearFundingSearchSelection = useCallback(() => {
        dispatch(initialiseFundingSearchSelection(match.params.fundingStreamId, match.params.fundingPeriodId, match.params.specificationId));
    }, [match.params]);

    const handleConfirm = async () => {
        if (!fundingConfiguration) {
            return;
        }
        setIsConfirming(true);
        try {
            const specId = match.params.specificationId;
            if (fundingConfiguration.approvalMode === ApprovalMode.Batches) {
                if (match.params.mode === FundingActionType.Approve) {
                    setJobId((await publishService.approveProvidersFundingService(specId, state.selectedProviderIds)).data.jobId);
                } else if (match.params.mode === FundingActionType.Release) {
                    setJobId((await publishService.releaseProvidersFundingService(specId, state.selectedProviderIds)).data.jobId);
                }
            } else {
                if (match.params.mode === FundingActionType.Approve) {
                    setJobId((await publishService.approveSpecificationFundingService(specId)).data.jobId);
                } else if (match.params.mode === FundingActionType.Release) {
                    setJobId((await publishService.releaseSpecificationFundingService(specId)).data.jobId);
                }
            }
        } catch (e) {
            addError({error: e, description: `Error while trying to ${match.params.mode.toLowerCase()} specification`})
            setIsConfirming(false);
        }
    }


    return (
        <div>
            <Header location={Section.Approvals}/>
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"}/>
                    <Breadcrumb name={"Approvals"}/>
                    <Breadcrumb name={"Select specification"} url={"/Approvals/Select"}/>
                    <Breadcrumb name="Funding approval results"
                                url={`/Approvals/SpecificationFundingApproval/${match.params.fundingStreamId}/${match.params.fundingPeriodId}/${match.params.specificationId}`}/>
                    <Breadcrumb name={match.params.mode + " funding"}/>
                </Breadcrumbs>

                <PermissionStatus requiredPermissions={missingPermissions} hidden={!isPermissionsFetched}/>

                <div>
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
                        Confirm funding {match.params.mode === FundingActionType.Approve ? "approval" : "release"}
                    </h1>
                    <span className="govuk-caption-xl govuk-!-margin-bottom-8">
                        Check the information below carefully before {match.params.mode === FundingActionType.Approve ? "approving" : "releasing"} the funding
                    </span>
                </div>

                <MultipleErrorSummary errors={errors}/>

                {!isCheckingForJob && latestJob && latestJob.isActive &&
                <div className="govuk-grid-row govuk-!-margin-bottom-3">
                    <div className="govuk-grid-column-three-quarters">
                        <JobNotificationBanner
                            job={latestJob}
                            isCheckingForJob={isCheckingForJob}/>
                    </div>
                </div>
                }

                {(isLoadingSpecification || isCheckingForJob || isLoadingFundingConfiguration || isConfirming || !isPermissionsFetched) &&
                <div className="govuk-grid-row govuk-!-margin-bottom-3">
                    <div className="govuk-grid-column-full govuk-!-margin-bottom-5">
                        <LoadingStatus title={isConfirming ? "Waiting for job to run" :
                            isCheckingForJob ? "Checking for jobs running" :
                                isLoadingSpecification ? "Loading specification" :
                                    isLoadingFundingConfiguration ? "Loading funding configuration" :
                                        !isPermissionsFetched ? "Checking permissions" :
                                            "Loading"} description="Please wait..."/>
                    </div>
                </div>
                }

                {specificationLastUpdatedDate !== undefined && latestJob?.lastUpdated !== undefined
                && latestJob.lastUpdated < specificationLastUpdatedDate &&
                <dl className="govuk-summary-list govuk-summary-list--no-border core-provider-dataversion">
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                            Last refresh
                        </dt>
                        <dd className="govuk-summary-list__value" data-testid="last-refresh">
                            <DateTimeFormatter date={latestJob.lastUpdated}/>
                            <span> by {latestJob.invokerUserDisplayName}</span>
                        </dd>
                    </div>
                    <div className="govuk-summary-list__row">
                        <dt className="govuk-summary-list__key">
                            Last calculation results update
                        </dt>
                        <dd className="govuk-summary-list__value" data-testid="last-calculation-results"><DateTimeFormatter
                            date={specificationLastUpdatedDate}
                        />
                        </dd>
                    </div>
                </dl>
                }
                
                {fundingConfiguration && specification && hasPermissionToApprove !== undefined && hasPermissionToRelease !== undefined &&
                <section data-testid="funding-summary-section">
                    <div className="govuk-grid-row govuk-!-margin-bottom-3">
                        <div className="govuk-grid-column-three-quarters">
                            <div className="govuk-warning-text">
                                <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
                                <strong className="govuk-warning-text__text">
                                    <span className="govuk-warning-text__assistive">Warning</span>
                                    Approved funding values can change when data or calculations are altered. If the funding values change, their
                                    status will become ‘updated’ and they will need to be approved again.
                                </strong>
                            </div>
                        </div>
                    </div>
                    <FundingConfirmationSummary
                        routingParams={match.params}
                        approvalMode={fundingConfiguration.approvalMode}
                        specification={specification}
                        fundingSummary={fundingSummary}
                        canApproveFunding={hasPermissionToApprove}
                        canReleaseFunding={hasPermissionToRelease}
                        addError={addError}
                        isWaitingForJob={isWaitingForJob}
                    />
                </section>
                }

                {jobId && jobId.length > 0 && latestJob && latestJob.isComplete ?
                    <div className="govuk-grid-row govuk-!-margin-top-6">
                        <div className="govuk-grid-column-full">
                            <Link className="govuk-button govuk-button--secondary"
                                  data-module="govuk-button"
                                  to={previousPage.path}>
                                Back
                            </Link>
                        </div>
                    </div>
                    :
                    <div className="govuk-grid-row govuk-!-margin-right-0">
                        <div className="govuk-grid-column-three-quarters">
                            <button data-prevent-double-click="true"
                                    className="govuk-button govuk-!-margin-right-1"
                                    data-module="govuk-button"
                                    disabled={isLoading || isWaitingForJob || !fundingSummary}
                                    onClick={handleConfirm}>
                                Confirm {match.params.mode === FundingActionType.Approve ? "approval" : "release"}
                            </button>
                            <a className="govuk-button govuk-button--secondary"
                               data-module="govuk-button"
                               onClick={() => history.goBack()}>
                                Cancel
                            </a>
                        </div>
                    </div>
                }
            </div>
            <Footer/>
        </div>
    );
}