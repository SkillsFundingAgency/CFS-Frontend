import React, {useMemo} from "react";
import {DateTimeFormatter} from "../DateTimeFormatter";
import {JobDetails} from "../../types/jobDetails";

export interface JobNotificationTextProps {
    heading?: string;
    description?: string;
}

export interface JobProgressNotificationBannerProps {
    job: JobDetails | undefined,
    displayFailedJob?: boolean,
    jobInProgressOverride?: JobNotificationTextProps,
    jobFailedOverride?: JobNotificationTextProps,
    jobSuccessfulOverride?: JobNotificationTextProps,
    displaySuccessfulJob?: boolean
}

export function JobProgressNotificationBanner(props: JobProgressNotificationBannerProps) {

    const title = useMemo(() => {
        if (!props.job) return '';

        if (props.job.isActive && props.jobInProgressOverride)
            return props.jobInProgressOverride.heading;

        if (props.job.isFailed && props.jobFailedOverride)
            return props.jobFailedOverride.heading;

        if (props.job.isSuccessful && props.jobSuccessfulOverride)
            return props.jobSuccessfulOverride.heading;

        return `Job ${props.job.statusDescription}: ${props.job.jobDescription}${props.job.outcome && props.job.outcome.length > 0 ? ": " + props.job.outcome : ""}`;
        
    }, [props.job, props.jobFailedOverride, props.jobInProgressOverride, props.jobSuccessfulOverride]);
    
    const description = useMemo(() => {
        if (!props.job) return '';

        if (props.job.isActive && props.jobInProgressOverride)
            return props.jobInProgressOverride.description;

        if (props.job.isFailed && props.jobFailedOverride)
            return props.jobFailedOverride.description;

        if (props.job.isSuccessful && props.jobSuccessfulOverride)
            return props.jobSuccessfulOverride.description;

        return undefined;
        
    }, [props.job, props.jobFailedOverride, props.jobInProgressOverride, props.jobSuccessfulOverride]);

    const cssClass = useMemo(() => {
        if (!props.job) return '';

        return props.job.isFailed ? "govuk-error-summary-red" :
            props.job.isSuccessful ? "govuk-error-summary-green" :
                props.job.isActive ? "govuk-error-summary-orange" :
                    "";
        
    }, [props.job]);

    if (!props.job) {
        return null;
    }

    if (props.displaySuccessfulJob != null && !props.displaySuccessfulJob && props.job.isSuccessful) {
        return null;
    }

    if (props.displayFailedJob != null && !props.displayFailedJob && props.job.isFailed) {
        return null;
    }
    
    return <div
        className={`govuk-error-summary ${cssClass}`}
        aria-labelledby="error-summary-title"
        role="alert"
        tabIndex={-1}
        data-module="govuk-error-summary"
        data-testid="job-notification">

        <h2 className="govuk-error-summary__title" id="error-summary-title">
            <span data-testid="job-notification-title">
                {title}
            </span>
            {props.job.isActive &&
            <div className="loader loader-small" role="alert"/>
            }

            {props.job.isFailed && props.job.failures.length > 0 &&
            <ul className="govuk-list govuk-error-summary__list">
                {props.jobFailedOverride}
                {props.job.failures.map(f =>
                    <li>
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
                <li>
                    <p className="govuk-body">
                        {`Initiated by ${props.job.invokerUserDisplayName} on `}
                        <span data-testid="formatted-created-date">
                            <DateTimeFormatter date={props.job.created as Date}/>
                        </span>
                    </p>
                </li>
                {description &&
                <li>
                    <p className="govuk-body-s italic">
                        <span>
                            {description}
                        </span>
                    </p>
                </li>
                }
                {props.job.isFailed &&
                <li>
                    <p className="govuk-body-s">
                        <span>Job ID: {props.job.jobId}</span>
                    </p>
                </li>
                }
                {props.job.isComplete &&
                <li>
                    <p className="govuk-body-s">
                        <strong>Completed: </strong>
                        <span data-testid="formatted-completed-date">
                            <DateTimeFormatter date={props.job.lastUpdated as Date}/>
                        </span>
                    </p>
                </li>}
            </ul>
        </div>
    </div>
}