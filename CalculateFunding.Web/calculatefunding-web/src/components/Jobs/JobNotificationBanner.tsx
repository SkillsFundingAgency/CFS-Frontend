import React from "react";
import {DateFormatter} from "../DateFormatter";
import {RunningStatus} from "../../types/RunningStatus";
import {LoadingFieldStatus} from "../LoadingFieldStatus";
import {JobDetails} from "../../types/jobDetails";
import {LoadingStatus} from "../LoadingStatus";

export enum SpinnerDisplaySetting {
    HideSpinner,
    ShowFieldSpinner,
    ShowPageSpinner
}
export interface SpinnerSettings {
    display: SpinnerDisplaySetting,
    loadingText?: string,
    loadingDescription?: string
}
export interface JobNotificationBannerProps {
    job: JobDetails | undefined,
    isCheckingForJob: boolean,
    jobCompletedOutcomeFailedMessage?: string
    jobFailedMessage?: string,
    spinner?: SpinnerSettings
}

export function JobNotificationBanner(props: JobNotificationBannerProps) {
    
    if (props.isCheckingForJob) {
        const displaySetting = props.spinner && props.spinner.display ? props.spinner.display : SpinnerDisplaySetting.ShowFieldSpinner;
        switch (displaySetting) {
            case SpinnerDisplaySetting.ShowFieldSpinner:
                return <div className=" govuk-!-margin-bottom-4">
                    <LoadingFieldStatus 
                        title={props.spinner?.loadingText ? props.spinner.loadingText : "Checking for running jobs"}
                    />
                </div>
            case SpinnerDisplaySetting.ShowPageSpinner:
                return <div className=" govuk-!-margin-bottom-4">
                    <LoadingStatus 
                        title={props.spinner?.loadingText ? props.spinner.loadingText : "Checking for running jobs"}
                        description={props.spinner?.loadingDescription}
                    />
                </div>
            default:
                return null;
        }
    }

    if (!props.job) {
        return null;
    }

    return (<div data-testid="job-notification-banner"
                 className={props.job.isFailed || (props.job.isComplete && props.job.failures.length > 0) ? "govuk-error-summary" :
                     props.job.isActive ? "govuk-error-summary-orange" :
                         "govuk-error-summary-green"}
                 aria-labelledby="error-summary-title"
                 aria-label="job-notification"
                 role="alert"
                 data-module="govuk-error-summary">
        <h2 className="govuk-error-summary__title">

            {(props.job.isFailed || props.job.failures.length > 0) &&
            <div>There is a problem</div>
            }
            <div>Job {props.job.statusDescription}: {props.job.jobDescription}{props.job.outcome != null && props.job.outcome.length > 0 ? ": " + props.job.outcome : ""}</div>
            {props.job.isActive &&
            <div className="loader loader-small" role="alert" aria-live="assertive" aria-label="Monitoring job"/>
            }
            {props.job.failures.length > 0 &&
            <ul className="govuk-list govuk-error-summary__list">
                {props.job.failures.map((f, i) =>
                    <li key={i}>
                        <p className="govuk-body">
                            {f.jobDescription}: {f.description}
                        </p>
                    </li>
                )}
            </ul>
            }
        </h2>
        <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
                {props.job.isFailed &&
                <>
                    {props.jobFailedMessage ?
                        <li>
                            <p className="govuk-body">
                                {props.jobFailedMessage}
                            </p>
                            Try again later.
                        </li>
                        : props.jobCompletedOutcomeFailedMessage &&
                        <li>
                            <p className="govuk-body">
                                {props.jobCompletedOutcomeFailedMessage}
                            </p>
                        </li>
                    }
                    <li>
                        <p className="govuk-body-s">
                            <span>Job ID: {props.job.jobId}</span>
                        </p>
                    </li>
                </>
                }
                <li>
                    <p className="govuk-body">
                        <span>Job initiated by {props.job.invokerUserDisplayName} on </span>
                        <span><DateFormatter date={props.job.created as Date} /></span>
                    </p>
                </li>
                {(props.job.runningStatus === RunningStatus.InProgress || props.job.isComplete) &&
                <li>
                    <p className="govuk-body-s">
                        <strong>Results updated: </strong>
                        <DateFormatter date={props.job.lastUpdated as Date} />
                    </p>
                </li>
                }
            </ul>
        </div>
    </div>);
}