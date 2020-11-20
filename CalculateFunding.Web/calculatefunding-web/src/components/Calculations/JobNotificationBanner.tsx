import React from "react";
import {DateFormatter} from "../DateFormatter";
import {RunningStatus} from "../../types/RunningStatus";
import {LoadingFieldStatus} from "../LoadingFieldStatus";
import {ErrorSummary} from "../ErrorSummary";
import {JobDetails} from "../../helpers/jobDetailsHelper";

export interface JobNotificationBannerProps {
    job: JobDetails | undefined,
    isCheckingForJob: boolean,
    hasJobError: boolean,
    jobError: string,
}

export function JobNotificationBanner(props: JobNotificationBannerProps) {
    if (props.isCheckingForJob) {
        return <div className=" govuk-!-margin-bottom-4">
            <LoadingFieldStatus title={"Checking for running jobs"}/>
        </div>
    }

    if (props.hasJobError) {
        return <ErrorSummary title={"Error while checking for latest job"} error={props.jobError}
                             suggestion={"Please try again later"}/>
    }

    if (!props.job) {
        return null;
    }

    return (<div className={props.job.isFailed ? "govuk-error-summary" :
        props.job.isActive ? "govuk-error-summary-orange" :
            "govuk-error-summary-green"}
                 aria-labelledby="error-summary-title"
                 aria-label="job-notification"
                 role="alert"
                 data-module="govuk-error-summary">
        <h2 className="govuk-error-summary__title">
            Job {props.job.statusDescription}: {props.job.jobDescription}{props.job.outcome.length > 0 ? ": " + props.job.outcome : ""}
        </h2>
        <h3>
            {props.job.isActive &&
            <LoadingFieldStatus title={`Monitoring...`}/>
            }
        </h3>
        <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
                <li>
                    <p className="govuk-body">
                        Job initiated by {props.job.invokerUserDisplayName} on <DateFormatter
                        date={props.job.created as Date} utc={true}/>
                    </p>
                </li>
                <li hidden={props.job.completionStatus == null || props.job.runningStatus === RunningStatus.InProgress}>
                    <p className="govuk-body-s">
                        <strong>Results updated: </strong>
                        <DateFormatter date={props.job.lastUpdated as Date} utc={true}/>
                    </p>
                </li>
            </ul>
        </div>
    </div>);
}