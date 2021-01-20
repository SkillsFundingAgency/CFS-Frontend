import {RouteComponentProps, useHistory} from "react-router";
import React, {useEffect, useState} from "react";
import {Header} from "../../components/Header";
import {Section} from "../../types/Sections";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {PermissionStatus} from "../../components/PermissionStatus";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {SpecificationPermissions, useSpecificationPermissions} from "../../hooks/useSpecificationPermissions";
import {useLatestSpecificationJobWithMonitoring} from "../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {JobType} from "../../types/jobType";
import {useSpecificationSummary} from "../../hooks/useSpecificationSummary";
import {useFundingConfiguration} from "../../hooks/useFundingConfiguration";
import {useErrors} from "../../hooks/useErrors";
import {FundingConfirmationSummary} from "../../components/Funding/FundingConfirmationSummary";
import {FundingActionType} from "../../types/PublishedProvider/PublishedProviderFundingCount";
import {LoadingStatus} from "../../components/LoadingStatus";
import {JobNotificationBanner} from "../../components/Jobs/JobNotificationBanner";
import {Link} from "react-router-dom";
import {approveProvidersFundingService, approveSpecificationFundingService, releaseProvidersFundingService, releaseSpecificationFundingService} from "../../services/publishService";
import {ApprovalMode} from "../../types/ApprovalMode";
import {Footer} from "../../components/Footer";
import {FundingSearchSelectionState} from "../../states/FundingSearchSelectionState";
import {useDispatch, useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {RunningStatus} from "../../types/RunningStatus";
import {HistoryPage} from "../../types/HistoryPage";
import {initialiseFundingSearchSelection} from "../../actions/FundingSearchSelectionActions";


export interface ConfirmFundingRouteProps {
    fundingStreamId: string,
    fundingPeriodId: string,
    specificationId: string,
    mode: FundingActionType
}

export function ConfirmFunding({match}: RouteComponentProps<ConfirmFundingRouteProps>) {
    const fundingStreamId = match.params.fundingStreamId;
    const fundingPeriodId = match.params.fundingPeriodId;
    const specificationId = match.params.specificationId;
    const mode = match.params.mode;
    const history = useHistory();
    const dispatch = useDispatch();

    const previousPage: HistoryPage =
        (history.location.state as any) &&
        (history.location.state as any).previousPage as HistoryPage ?
            (history.location.state as any).previousPage :
            {
                title: "Funding approval results",
                path: `/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`
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
        useSpecificationSummary(specificationId, err => addErrorMessage(err.message, "Error while loading specification"));
    const {canApproveFunding, canReleaseFunding, missingPermissions} =
        useSpecificationPermissions(specificationId, [SpecificationPermissions.Approve, SpecificationPermissions.Release]);
    const {fundingConfiguration, isLoadingFundingConfiguration} =
        useFundingConfiguration(fundingStreamId, fundingPeriodId,
            err => addErrorMessage(err.message, "", "Error while loading funding configuration"));
    const {errors, addErrorMessage, addError} = useErrors();
    const [jobId, setJobId] = useState<string>("");
    const [isConfirming, setIsConfirming] = useState<boolean>(false);

    useEffect(() => handleActionJobComplete(), [latestJob]);

    const handleActionJobComplete = () => {
        if (jobId.length > 0 && latestJob && latestJob.jobId === jobId) {
            setIsConfirming(false);
            if (latestJob.isComplete && latestJob.isSuccessful) {
                clearFundingSearchSelection();
                history.push(`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`);
            }
        }
    };

    const clearFundingSearchSelection = () => {
        dispatch(initialiseFundingSearchSelection(fundingStreamId, fundingPeriodId, specificationId));
    }

    const handleConfirm = async () => {
        if (!fundingConfiguration) {
            return;
        }
        setIsConfirming(true);
        try {
            if (fundingConfiguration.approvalMode === ApprovalMode.Batches) {
                if (mode === FundingActionType.Approve) {
                    setJobId((await approveProvidersFundingService(specificationId, state.providerVersionIds)).data.jobId);
                } else if (mode === FundingActionType.Release) {
                    setJobId((await releaseProvidersFundingService(specificationId, state.providerVersionIds)).data.jobId);
                }
            } else {
                if (mode === FundingActionType.Approve) {
                    setJobId((await approveSpecificationFundingService(specificationId)).data.jobId);
                } else if (mode === FundingActionType.Release) {
                    setJobId((await releaseSpecificationFundingService(specificationId)).data.jobId);
                }
            }
        } catch (e) {
            addErrorMessage(e, `Error while trying to ${mode.toLowerCase()} specification`)
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
                                url={`/Approvals/SpecificationFundingApproval/${fundingStreamId}/${fundingPeriodId}/${specificationId}`}/>
                    <Breadcrumb name={mode + " funding"}/>
                </Breadcrumbs>

                <PermissionStatus requiredPermissions={missingPermissions} hidden={isLoadingSpecification}/>

                <div>
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Confirm funding approval</h1>
                    <span className="govuk-caption-xl govuk-!-margin-bottom-8">
                        Check the information below carefully before {mode === FundingActionType.Approve ? "approving" : "releasing"} the funding
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

                {(isLoadingSpecification || isCheckingForJob || isLoadingFundingConfiguration || isConfirming) &&
                <div className="govuk-grid-row govuk-!-margin-bottom-3">
                    <div className="govuk-grid-column-full govuk-!-margin-bottom-5">
                        <LoadingStatus title={isConfirming ? "Waiting for job to run" :
                            isCheckingForJob ? "Checking for jobs running" :
                                isLoadingSpecification ? "Loading specification" :
                                    "Loading funding configuration"} description="Please wait..."/>
                    </div>
                </div>
                }

                {!isLoadingSpecification && !isLoadingFundingConfiguration &&
                fundingConfiguration && specification &&
                fundingConfiguration.approvalMode !== ApprovalMode.Undefined &&
                canApproveFunding !== undefined && canReleaseFunding !== undefined &&
                <>
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
                        actionType={mode}
                        approvalMode={fundingConfiguration.approvalMode}
                        specification={specification}
                        fundingStreamId={fundingStreamId}
                        fundingPeriodId={fundingPeriodId}
                        canApproveFunding={canApproveFunding}
                        canReleaseFunding={canReleaseFunding}
                        addError={addErrorMessage}
                        isLoading={(isLoadingFundingConfiguration || isCheckingForJob || isConfirming || !specification || !fundingConfiguration ||
                            latestJob && latestJob.runningStatus !== RunningStatus.Completed) === true}
                    />
                </>
                }

                {jobId.length > 0 && latestJob && latestJob.isComplete ?
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
                                    disabled={isLoadingFundingConfiguration || isCheckingForJob || isConfirming || !specification || !fundingConfiguration ||
                                    latestJob && latestJob.runningStatus !== RunningStatus.Completed}
                                    onClick={handleConfirm}>
                                Confirm {mode === FundingActionType.Approve ? "approval" : "release"}
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