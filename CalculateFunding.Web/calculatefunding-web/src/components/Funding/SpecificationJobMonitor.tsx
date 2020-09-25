import React, {useEffect, useState} from "react";
import {getJobStatusUpdatesForSpecification} from "../../services/jobService";
import {RunningStatus} from "../../types/RunningStatus";
import {AxiosError} from "axios";
import {HubConnectionBuilder} from "@microsoft/signalr";
import {JobMessage} from "../../types/jobMessage";
import {JobSummary} from "../../types/jobSummary";
import {LoadingStatus} from "../LoadingStatus";

export interface ISpecificationJobMonitorProps {
    specificationId: string,
    isJobRunning: boolean,
    setIsJobRunning: (is: boolean) => void,
    isCheckingForJobs: boolean,
    setIsCheckingForJobs: (is: boolean) => void,
    addError: (errorMessage: string, fieldName?: string) => void,
}

export function SpecificationJobMonitor(props: ISpecificationJobMonitorProps) {
    const jobTypes = "RefreshFundingJob,ApproveAllProviderFundingJob,ApproveBatchProviderFundingJob,PublishBatchProviderFundingJob,PublishAllProviderFundingJob";
    const [latestJob, setLatestJob] = useState<JobSummary>();

    useEffect(() => {
        if (props.isCheckingForJobs) {
            checkForExistingRunningJob();
        }
    }, [props.isCheckingForJobs]);

    async function checkForExistingRunningJob() {
        getJobStatusUpdatesForSpecification(props.specificationId, jobTypes)
            .then((result) => {
                props.setIsCheckingForJobs(false);
                if (result.data && result.data.length > 0) {
                    const runningJob = result.data.find((item) => item !== null && item.runningStatus !== RunningStatus.Completed);
                    if (runningJob) {
                        props.setIsJobRunning(true);
                        setLatestJob({
                            jobId: runningJob.jobId,
                            jobType: runningJob.jobType,
                            completionStatus: runningJob.completionStatus,
                            runningStatus: runningJob.runningStatus,
                            lastUpdated: runningJob.lastUpdated
                        });
                    } else {
                        props.setIsJobRunning(false);
                        setLatestJob(undefined);
                    }
                } else {
                    props.setIsJobRunning(false);
                    setLatestJob(undefined);
                }
            })
            .catch((error: AxiosError) => {
                setLatestJob(undefined);
                props.setIsJobRunning(false);
                props.addError(`Error while checking for existing jobs: ${error.message}`);
            })
            .finally(() => {
                monitorSpecJobNotifications(props.specificationId);
            });
    }

    async function monitorSpecJobNotifications(specId: string) {
        const hubConnect = new HubConnectionBuilder()
            .withUrl(`/api/notifications`)
            .build();
        hubConnect.keepAliveIntervalInMilliseconds = 1000 * 60 * 3;
        hubConnect.serverTimeoutInMilliseconds = 1000 * 60 * 6;

        try {
            await hubConnect.start();
            hubConnect.on('NotificationEvent', (job: JobMessage) => {
                if (job && job.runningStatus && job.runningStatus !== RunningStatus.Completed) {
                    props.setIsJobRunning(true);
                    setLatestJob({
                        jobId: job.jobId,
                        jobType: job.jobType,
                        completionStatus: job.completionStatus,
                        runningStatus: job.runningStatus as unknown as RunningStatus,
                        lastUpdated: job.statusDateTime as unknown as Date
                    });
                } else {
                    setLatestJob(undefined);
                    props.setIsJobRunning(false);
                }
            });
            await hubConnect.invoke("StartWatchingForSpecificationNotifications", specId);
        } catch (err) {
            props.addError(`Error while monitoring jobs: ${err.message}`);
            await hubConnect.stop();
            // re-trigger job monitoring
            await checkForExistingRunningJob();
        }
    }

    function getJobProgressMessage(job: JobSummary) {
        switch (job.jobType) {
            case "RefreshFundingJob":
                return "Refreshing funding";
            case "ApproveFunding":
                return "Approving funding";
            case "PublishProviderFundingJob":
                return "Releasing funding";
            case "ApproveAllProviderFundingJob":
                return "Approving all provider funding";
            case "ApproveBatchProviderFundingJob":
                return "Approving batch provider funding";
            case "PublishBatchProviderFundingJob":
                return "Publishing batch provider funding";
            case "PublishAllProviderFundingJob":
                return "Publishing all provider funding";
            default:
                return job.jobType ? job.jobType : "";
        }
    }

    if (props.isCheckingForJobs || props.isJobRunning) {
        return (
            <LoadingStatus title={`Job running: ${latestJob ? getJobProgressMessage(latestJob) : "Checking for jobs..."} `}
                subTitle={props.isCheckingForJobs ?
                    "Searching for any running jobs" :
                    "Monitoring job progress. Please wait, this could take several minutes"}
                testid='loadingJobs' />
        );
    } else {
        return null;
    }
}
