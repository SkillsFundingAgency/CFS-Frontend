import React from "react";
import {DateFormatter} from "../DateFormatter";
import {RunningStatus} from "../../types/RunningStatus";
import {CompletionStatus} from "../../types/CompletionStatus";
import {LoadingFieldStatus} from "../LoadingFieldStatus";
import {ErrorSummary} from "../ErrorSummary";
import {JobSummary} from "../../types/jobSummary";

export interface ICalculationJobNotificationProps {
    latestJob: JobSummary | undefined,
    anyJobsRunning: boolean,
    isCheckingForJob: boolean,
    hasJobError: boolean,
    jobError: string,
    jobProgressMessage: string,
}

export function CalculationJobNotification(props: ICalculationJobNotificationProps) {
    let jobSummaryTitle = "";
    let jobSummaryColour = "";


    if (props.isCheckingForJob) {
        return <div className=" govuk-!-margin-bottom-4">
            <LoadingFieldStatus title={"Checking for running jobs"}/>
        </div>
    }

    if (props.hasJobError) {
        return <ErrorSummary title={"Error while checking for latest job"} error={props.jobError} suggestion={"Please try again later"}/>
    }

    if (!props.latestJob) {
        return null;
    }

    switch (props.latestJob.runningStatus) {
        case RunningStatus.Queued:
        case RunningStatus.QueuedWithService:
            jobSummaryTitle = "Job in queue";
            jobSummaryColour = "govuk-error-summary govuk-error-summary-orange";
            break;
        case RunningStatus.InProgress:
            jobSummaryTitle = "Job in progress";
            jobSummaryColour = "govuk-error-summary govuk-error-summary-orange";
            break;
        default:
            switch (props.latestJob.completionStatus) {
                case CompletionStatus.Succeeded:
                    jobSummaryTitle = "Job completed successfully";
                    jobSummaryColour = "govuk-error-summary govuk-error-summary-green";
                    break;
                case CompletionStatus.Cancelled:
                    jobSummaryTitle = "Job cancelled";
                    jobSummaryColour = "govuk-error-summary";
                    break;
                case CompletionStatus.Failed:
                    jobSummaryTitle = "Job failed";
                    jobSummaryColour = "govuk-error-summary";
                    break;
                case CompletionStatus.TimedOut:
                    jobSummaryTitle = "Job timed out";
                    jobSummaryColour = "govuk-error-summary";
                    break;
                default:
                    jobSummaryTitle = "Job " + props.latestJob.completionStatus;
                    jobSummaryColour = "govuk-error-summary";
                    break;
            }
            break;
    }

    return (<div className={jobSummaryColour}
                 aria-labelledby="error-summary-title" role="alert"
                 data-module="govuk-error-summary">
        <h2 className="govuk-error-summary__title">
            {jobSummaryTitle}: {props.jobProgressMessage}
        </h2>
        <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
                <li>
                    <p className="govuk-body">
                        Job initiated by {props.latestJob.invokerUserDisplayName} on <DateFormatter
                        date={props.latestJob.created as Date} utc={true}/>
                    </p>
                </li>
                <li hidden={props.latestJob.completionStatus == null || props.latestJob.runningStatus === RunningStatus.InProgress}>
                    <p className="govuk-body-s">
                        <strong>Results updated: </strong>
                        <DateFormatter date={props.latestJob.lastUpdated as Date} utc={true}/>
                    </p>
                </li>
            </ul>
        </div>
    </div>);
}