import React from "react";
import {DateFormatter} from "../DateFormatter";
import {RunningStatus} from "../../types/RunningStatus";
import {LoadingFieldStatus} from "../LoadingFieldStatus";
import {ErrorSummary} from "../ErrorSummary";
import {JobSummary} from "../../types/jobSummary";
import {JobDisplayProps} from "../../helpers/getJobDisplayProps";

export interface ICalculationJobNotificationProps {
    latestJob: JobSummary | undefined,
    anyJobsRunning: boolean,
    isCheckingForJob: boolean,
    hasJobError: boolean,
    jobError: string,
    jobDisplayInfo: JobDisplayProps | undefined
}

export function CalculationJobNotification(props: ICalculationJobNotificationProps) {
    if (props.isCheckingForJob) {
        return <div className=" govuk-!-margin-bottom-4">
            <LoadingFieldStatus title={"Checking for running jobs"}/>
        </div>
    }

    if (props.hasJobError) {
        return <ErrorSummary title={"Error while checking for latest job"} error={props.jobError}
                             suggestion={"Please try again later"}/>
    }

    if (!props.latestJob || !props.jobDisplayInfo) {
        return null;
    }

    return (<div className={props.jobDisplayInfo.isFailed ? "govuk-error-summary" :
        props.jobDisplayInfo.isActive ? "govuk-error-summary govuk-error-summary-orange" :
            "govuk-error-summary govuk-error-summary-green"}
                 aria-labelledby="error-summary-title" 
                 role="alert"
                 data-module="govuk-error-summary">
        <h2 className="govuk-error-summary__title">
            Job {props.jobDisplayInfo.statusDescription}: {props.jobDisplayInfo.jobDescription}
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