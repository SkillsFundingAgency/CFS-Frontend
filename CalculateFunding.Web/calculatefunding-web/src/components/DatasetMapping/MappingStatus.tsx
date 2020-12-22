import React from "react";
import {DateFormatter} from "../DateFormatter";
import {JobDetails} from "../../types/jobDetails";

export interface MappingStatusProps {
    job: JobDetails | undefined,
}

export function MappingStatus(props: MappingStatusProps) {
    if (!props.job) {
        return null;
    }
    const cssClass = props.job.isFailed ? "govuk-error-summary-red" :
        props.job.isSuccessful ? "govuk-error-summary-green" :
            props.job.isActive ? "govuk-error-summary-orange" :
                "";

    return <div
        className={`govuk-error-summary ${cssClass}`}
        aria-labelledby="error-summary-title"
        role="alert"
        tabIndex={-1}
        data-module="govuk-error-summary"
        data-testid="job-notification">
        <h2 className="govuk-error-summary__title" id="error-summary-title">
            <span data-testid="job-notification-title">
                Job {props.job.statusDescription}: {props.job.jobDescription}{props.job.outcome && props.job.outcome.length > 0 ? ": " + props.job.outcome : ""}
                </span>
            {props.job.isActive &&
            <div className="loader loader-small" role="alert" aria-live="assertive" aria-label="Monitoring job"/>
            }
            {props.job.isFailed && props.job.failures.length > 0 &&
            <ul className="govuk-list govuk-error-summary__list">
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
                        {`Mapping initiated by ${props.job.invokerUserDisplayName} on `}
                        <span data-testid="formatted-created-date"><DateFormatter date={props.job.created as Date}
                                                                                  utc={false}/></span>
                    </p>
                </li>
                {props.job.isComplete &&
                <li>
                    <p className="govuk-body-s">
                        <strong>Completed: </strong>
                        <span data-testid="formatted-completed-date">
                            <DateFormatter date={props.job.lastUpdated as Date} utc={false}/>
                        </span>
                    </p>
                </li>}
            </ul>
        </div>
    </div>
}