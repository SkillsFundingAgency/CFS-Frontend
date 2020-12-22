import React, {useEffect, useState} from "react";
import {Breadcrumb, Breadcrumbs} from "../../components/Breadcrumbs";
import {Footer} from "../../components/Footer";
import {Header} from "../../components/Header";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {useOptionsForSpecificationsSelectedForFunding} from "../../hooks/FundingApproval/useOptionsForSpecificationsSelectedForFunding";
import {Section} from "../../types/Sections";
import {FundingPeriodWithSpecificationSelectedForFunding, FundingStreamWithSpecificationSelectedForFunding} from "../../types/SpecificationSelectedForFunding";
import {useErrors} from "../../hooks/useErrors";
import {JobType} from "../../types/jobType";
import {DateFormatter} from "../../components/DateFormatter";
import {useQuery} from "react-query";
import {LatestPublishedDate} from "../../types/PublishedProvider/LatestPublishedDate";
import {AxiosError} from "axios";
import {getLatestPublishedDate, runSqlImportJob} from "../../services/publishService";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";
import {useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {PermissionStatus} from "../../components/PermissionStatus";
import {useMonitorForNewSpecificationJob} from "../../hooks/Jobs/useMonitorForNewSpecificationJob";
import {useFetchAllLatestSpecificationJobs} from "../../hooks/Jobs/useFetchAllLatestSpecificationJobs";
import {LoadingStatus} from "../../components/LoadingStatus";
import {useHistory} from "react-router";
import {RunningStatus} from "../../types/RunningStatus";
import {CompletionStatus} from "../../types/CompletionStatus";
import {getLatestSuccessfulJob} from "../../services/jobService";
import {JobDetails} from "../../types/jobDetails";
import {getJobDetailsFromJobResponse} from "../../helpers/jobDetailsHelper";

export function RefreshSql() {
    const permissions: FundingStreamPermissions[] = useSelector((state: IStoreState) => state.userState.fundingStreamPermissions);
    const {errors, addErrorMessage} = useErrors()
    const history = useHistory();
    const [sqlJobStatusMessage, setSqlJobStatusMessage] = useState<string>('Data push queued');
    const [fundingStatusMessage, setFundingStatusMessage] = useState<string>('Funding job running');
    const [missingPermissions, setMissingPermissions] = useState<string[]>([]);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [isAnotherUserRunningSqlJob, setIsAnotherUserRunningSqlJob] = useState<boolean>(false);
    const [isAnotherUserRunningFundingJob, setIsAnotherUserRunningFundingJob] = useState<boolean>(false);
    const [refreshJobId, setRefreshJobId] = useState<string>("");
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const [refreshJobDateTime, setRefreshJobDateTime] = useState<Date | undefined>();
    const [selectedFundingStream, setSelectedFundingStream] = useState<FundingStreamWithSpecificationSelectedForFunding>();
    const [selectedFundingPeriod, setSelectedFundingPeriod] = useState<FundingPeriodWithSpecificationSelectedForFunding>();
    const {fundingStreams, isLoadingOptions, errorCheckingForOptions, isErrorCheckingForOptions} = useOptionsForSpecificationsSelectedForFunding();
    const specificationId = selectedFundingPeriod ? selectedFundingPeriod.specifications[0].id : "";
    const specificationName = selectedFundingPeriod ? selectedFundingPeriod.specifications[0].name : "";
    const {newJob} = useMonitorForNewSpecificationJob(
        specificationId,
        [JobType.RunSqlImportJob, JobType.ApproveBatchProviderFundingJob, JobType.ApproveAllProviderFundingJob,
        JobType.RefreshFundingJob, JobType.PublishAllProviderFundingJob, JobType.PublishBatchProviderFundingJob,
        JobType.ReIndexPublishedProvidersJob],
        err => addErrorMessage("An error occurred while monitoring the running jobs.")
    );
    const {allJobs, isCheckingForJobs} = useFetchAllLatestSpecificationJobs(
        specificationId,
        [JobType.RunSqlImportJob, JobType.ApproveBatchProviderFundingJob, JobType.ApproveAllProviderFundingJob,
        JobType.RefreshFundingJob, JobType.PublishAllProviderFundingJob, JobType.PublishBatchProviderFundingJob,
        JobType.ReIndexPublishedProvidersJob],
        err => addErrorMessage("An error occurred while fetching the latest jobs.")
    );
    const fundingStreamId = selectedFundingStream ? selectedFundingStream.id : "";
    const fundingPeriodId = selectedFundingPeriod ? selectedFundingPeriod.id : "";

    const {data: lastSqlJob, isLoading: isCheckingForLatestSqlJob} = useQuery<JobDetails | undefined, AxiosError>(`last-successful-sql-job-${specificationId}-runsqljob`,
        async () => getJobDetailsFromJobResponse((await getLatestSuccessfulJob(specificationId, JobType.RunSqlImportJob)).data),
        {
            cacheTime: 0,
            refetchOnWindowFocus: false,
            enabled: specificationId && specificationId.length > 0,
            onError: err => addErrorMessage(err.message, "Error while loading last successful sql job")
        });

    const hasRunningFundingJobs: boolean = allJobs && allJobs.filter(job => job.jobType !== undefined
        && job.jobType !== JobType.RunSqlImportJob && job.runningStatus !== RunningStatus.Completed
        && job.specificationId === specificationId).length > 0 || false;
    const hasRunningSqlJob: boolean = allJobs && allJobs.filter(job => job.jobType !== undefined
        && job.jobType === JobType.RunSqlImportJob && job.runningStatus !== RunningStatus.Completed
        && job.specificationId === specificationId).length > 0 || false;
    if (hasRunningSqlJob && !isAnotherUserRunningSqlJob) {
        setIsAnotherUserRunningSqlJob(true);
    }
    if (!hasRunningSqlJob && isAnotherUserRunningSqlJob) {
        setIsAnotherUserRunningSqlJob(false);
    }
    const fetchLatestPublishedDate = async () => {
        if (!fundingStreamId || !fundingPeriodId) return {
            value: null
        };
        return (await getLatestPublishedDate(fundingStreamId, fundingPeriodId)).data;
    }

    const {data: latestPublishedDate, isLoading: isLoadingLatestPublishedDate, refetch} =
        useQuery<LatestPublishedDate, AxiosError>(`latest-published-date-${fundingStreamId}-${fundingPeriodId}`,
            fetchLatestPublishedDate,
            {
                onError: err => addErrorMessage(err.message, "Error while loading latest published date."),
                cacheTime: 0,
                refetchOnWindowFocus: false,
                enabled: false
            });

    useEffect(() => {
        refetch();
    }, [selectedFundingPeriod]);

    useEffect(() => {
        setMissingPermissions([]);
        if (!selectedFundingStream) return;
        const fundingStreamPermission = permissions.find(p => p.fundingStreamId === selectedFundingStream.id);
        if (!fundingStreamPermission || !fundingStreamPermission.canRefreshPublishedQa) {
            setMissingPermissions([`refresh published QA for funding stream ${selectedFundingStream.name}`]);
        }
    }, [permissions, selectedFundingStream]);

    useEffect(() => {
        if (errorCheckingForOptions.length > 0) {
            addErrorMessage(errorCheckingForOptions);
        }
    }, [errorCheckingForOptions]);

    useEffect(() => {
        if (!newJob || !newJob.jobType) return;
        if (newJob.jobType === JobType.RunSqlImportJob) {
            handleSqlImportJob(newJob);
        } else {
            handleOtherJobs(newJob);
        }
    }, [newJob]);

    function handleSqlImportJob(newJob: JobDetails) {
        if (refreshJobId.length === 0 && !isAnotherUserRunningSqlJob) {
            setIsAnotherUserRunningSqlJob(true);
        }
        switch (newJob.runningStatus) {
            case RunningStatus.Queued:
            case RunningStatus.QueuedWithService:
                setSqlJobStatusMessage("Data push queued");
                break;
            case RunningStatus.InProgress:
                setSqlJobStatusMessage("Data push in progress");
                break;
            case RunningStatus.Completing:
                setSqlJobStatusMessage("Data push completing");
                break;
            case RunningStatus.Completed:
                setSqlJobStatusMessage("Data push completed");
                setIsAnotherUserRunningSqlJob(false);
                if (newJob.isSuccessful) {
                    setRefreshJobDateTime(newJob.lastUpdated);
                } else {
                    setSqlJobStatusMessage("Data push failed");
                }
                break;
        }
        if (refreshJobId.length > 0 && newJob.jobId === refreshJobId && newJob.isComplete) {
            setIsRefreshing(false);
            if (newJob.isSuccessful) {
                setShowSuccess(true);
            } else {
                addErrorMessage("Refresh sql job failed: " + newJob.outcome);
            }
        }
    }

    function handleOtherJobs(newJob: JobDetails) {
        if (!isAnotherUserRunningFundingJob) {
            setIsAnotherUserRunningFundingJob(true);
        }
        switch (newJob.runningStatus) {
            case RunningStatus.Queued:
            case RunningStatus.QueuedWithService:
                setFundingStatusMessage("Job queued");
                break;
            case RunningStatus.InProgress:
                setFundingStatusMessage("Job in progress");
                break;
            case RunningStatus.Completing:
                setFundingStatusMessage("Job completing");
                break;
            case RunningStatus.Completed:
                setFundingStatusMessage("Job completed");
                setIsAnotherUserRunningFundingJob(false);
                refetch();
                break;
        }
    }

    function handleChangeFundingStream(e: React.ChangeEvent<HTMLSelectElement>) {
        if (fundingStreams) {
            setSelectedFundingStream(fundingStreams.find(stream => stream.id === e.target.value));
            setSelectedFundingPeriod(undefined);
        }
    }

    function handleChangeFundingPeriod(e: React.ChangeEvent<HTMLSelectElement>) {
        if (selectedFundingStream) {
            setSelectedFundingPeriod(selectedFundingStream.periods.find(period => period.id === e.target.value));
        }
    }

    function handlePushData() {
        async function pushData() {
            if (!selectedFundingStream) {
                throw new Error("A funding stream has not been selected.");
            }
            if (specificationId.length === 0) {
                throw new Error("The specification id has not been set.");
            }
            try {
                setIsRefreshing(true);
                const jobId = (await runSqlImportJob(specificationId, selectedFundingStream.id)).data.jobId;
                if (jobId === undefined || jobId === null) {
                    throw new Error("No job ID was returned");
                }
                setRefreshJobId(jobId);
            } catch (error) {
                addErrorMessage("The refresh sql import job could not be started: " + error.message);
                setIsRefreshing(false);
            }
        }

        pushData();
    }

    function handleContinueClick() {
        history.push('/');
    }

    function LastSqlUpdate() {
        if (isCheckingForJobs || isCheckingForLatestSqlJob) {
            return <LoadingFieldStatus title="Loading..." />
        }
        if (isAnotherUserRunningSqlJob) {
            return <LoadingFieldStatus title={sqlJobStatusMessage} />
        }
        if (refreshJobDateTime) {
            return (
                <DateFormatter
                    date={refreshJobDateTime}
                    utc={true} />
            );
        }
        if (!lastSqlJob || !lastSqlJob.lastUpdated) {
            return <span className="govuk-body">N/A</span>
        }
        const previousJobFailed = lastSqlJob.completionStatus !== CompletionStatus.Succeeded;

        return (
            <>
                <DateFormatter
                    date={lastSqlJob.lastUpdated}
                    utc={true} />
                <span className="govuk-body">{previousJobFailed ? " (Failed)" : ""}</span>
            </>
        );
    }

    function LastFundingDateChange() {
        if (isLoadingLatestPublishedDate) {
            return <LoadingFieldStatus title="Loading..." />
        }
        if (isAnotherUserRunningFundingJob || hasRunningFundingJobs) {
            return <LoadingFieldStatus title={fundingStatusMessage} />
        }
        if (!latestPublishedDate || latestPublishedDate.value === null) {
            return <span className="govuk-body">N/A</span>
        }
        return (
            <DateFormatter
                date={latestPublishedDate.value}
                utc={true} />
        );
    }

    function SqlJobStatusPanel() {
        if (!isRefreshing) {
            return null;
        }

        return (
            <LoadingStatus title={sqlJobStatusMessage}
                subTitle="Please wait, this could take several minutes"
                description="Please do not refresh the page, you will be redirected automatically"
                hidden={!isRefreshing} />
        )
    }

    function SuccessMessage() {
        if (!showSuccess) {
            return null;
        }

        return (
            <>
                <div className="govuk-grid-row ">
                    <div className="govuk-grid-column-full">
                        <div className="govuk-panel govuk-panel--confirmation ">
                            <h1 className="govuk-panel__title">
                                Refresh successful
                            </h1>
                        </div>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-full">
                        <dl className="govuk-summary-list govuk-summary-list--no-border">
                            <div className="govuk-summary-list__row">
                                <dt className="govuk-summary-list__key">
                                    Funding stream
                                </dt>
                                <dd className="govuk-summary-list__value">{selectedFundingStream?.name}</dd>
                            </div>
                            <div className="govuk-summary-list__row">
                                <dt className="govuk-summary-list__key">
                                    Funding period
                                </dt>
                                <dd className="govuk-summary-list__value">{selectedFundingPeriod?.name}</dd>
                            </div>
                            <div className="govuk-summary-list__row">
                                <dt className="govuk-summary-list__key">
                                    Specification
                                </dt>
                                <dd className="govuk-summary-list__value">{specificationName}</dd>
                            </div>
                            <div className="govuk-summary-list__row">
                                <dt className="govuk-summary-list__key">
                                    Last SQL update
                                </dt>
                                <dd className="govuk-summary-list__value">
                                    <DateFormatter
                                        date={refreshJobDateTime}
                                        utc={true} />
                                </dd>
                            </div>
                            <div className="govuk-summary-list__row">
                                <dt className="govuk-summary-list__key">
                                    Last funding data change
                                </dt>
                                <dd className="govuk-summary-list__value">
                                    <LastFundingDateChange />
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
                <button className="govuk-button" onClick={handleContinueClick}>Continue</button>
            </>
        )
    }

    function RefreshMessage() {
        if ((latestPublishedDate && lastSqlJob && latestPublishedDate.value !== null && lastSqlJob.lastUpdated
            && (latestPublishedDate.value <= lastSqlJob.lastUpdated ||
                (refreshJobDateTime && latestPublishedDate.value <= refreshJobDateTime)))) {
            return (
                <div className="govuk-inset-text">
                    Refresh SQL data is not available as the latest version has already been pushed.
                </div>
            )
        }
        return null;
    }

    function RefreshButton() {
        const isDisabled = !(
            (lastSqlJob === undefined || !lastSqlJob.lastUpdated || latestPublishedDate === undefined ||
                latestPublishedDate.value === null || latestPublishedDate.value > lastSqlJob.lastUpdated ||
                lastSqlJob.completionStatus === CompletionStatus.Failed ||
                lastSqlJob.completionStatus === CompletionStatus.TimedOut)
            && missingPermissions.length === 0 && !isLoadingOptions
            && !isCheckingForJobs && !isLoadingLatestPublishedDate && !isAnotherUserRunningSqlJob
            && !hasRunningFundingJobs && !isCheckingForLatestSqlJob
        );

        return (
            <button className="govuk-button" onClick={handlePushData} disabled={isDisabled}>
                Push data
            </button>
        );
    }

    function showSummaryAndButton() {
        return selectedFundingStream && selectedFundingPeriod &&
            selectedFundingPeriod.specifications.length > 0;
    }

    return (
        <>
            <Header location={Section.Datasets} />
            <div className="govuk-width-container">
                <Breadcrumbs>
                    <Breadcrumb name={"Calculate funding"} url={"/"} />
                    <Breadcrumb name={"Manage data"} url={"/Datasets/ManageData"} />
                    <Breadcrumb name={"Refresh SQL"} />
                </Breadcrumbs>
                <SqlJobStatusPanel />
                <SuccessMessage />
                {!isRefreshing && !showSuccess && <div className="govuk-main-wrapper">
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <PermissionStatus requiredPermissions={missingPermissions} hidden={permissions.length === 0} />
                        </div>
                    </div>
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-full">
                            <MultipleErrorSummary errors={errors} />
                        </div>
                    </div>
                    <div className="govuk-grid-row  govuk-!-margin-bottom-9">
                        <div className="govuk-grid-column-full">
                            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">Refresh SQL</h1>
                            <span className="govuk-caption-xl">Refresh SQL funding</span>
                        </div>
                    </div>
                    {!isErrorCheckingForOptions &&
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor="sort">
                                Funding stream
                            </label>
                            {!isLoadingOptions && fundingStreams && fundingStreams.length > 0 ?
                                <select className="govuk-select" id="funding-streams" name="sort" data-testid="funding-stream"
                                    onChange={handleChangeFundingStream}>
                                    <option>Please select</option>
                                    {fundingStreams.map(fs => <option key={fs.id} value={fs.id}>{fs.name}</option>)}
                                </select>
                                : <LoadingFieldStatus title={"Loading funding streams..."} />}
                        </div>}
                    {!isLoadingOptions && selectedFundingStream &&
                        <div className="govuk-form-group">
                            <label className="govuk-label" htmlFor="sort">
                                Funding period
                            </label>
                            <select className="govuk-select"
                                id="funding-periods"
                                data-testid={"funding-period"}
                                onChange={handleChangeFundingPeriod}>
                                <option>Please select</option>
                                {selectedFundingStream.periods.map(fp =>
                                    <option key={fp.id} value={fp.id}>{fp.name}</option>
                                )}
                            </select>
                        </div>}
                    {showSummaryAndButton() &&
                        <>
                            <div className="govuk-grid-row">
                                <div className="govuk-grid-column-full">
                                    <dl className="govuk-summary-list govuk-summary-list--no-border">
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">
                                                Specification
                                        </dt>
                                            <dd className="govuk-summary-list__value">
                                                {specificationName}
                                            </dd>
                                        </div>
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">
                                                Last SQL update
                                        </dt>
                                            <dd className="govuk-summary-list__value">
                                                <LastSqlUpdate />
                                            </dd>
                                        </div>
                                        <div className="govuk-summary-list__row">
                                            <dt className="govuk-summary-list__key">
                                                Last funding data change
                                        </dt>
                                            <dd className="govuk-summary-list__value">
                                                <LastFundingDateChange />
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                            <RefreshMessage />
                            <RefreshButton />
                        </>
                    }
                </div>}
            </div>
            <Footer />
        </>
    )
}