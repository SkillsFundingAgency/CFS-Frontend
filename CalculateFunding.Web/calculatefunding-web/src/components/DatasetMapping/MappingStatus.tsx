import React from "react";
import {DateFormatter} from "../DateFormatter";
import {JobSummary} from "../../types/jobSummary";
import {getJobDisplayProps} from "../../helpers/getJobDisplayProps";

export interface MappingStatusProps {
    job: JobSummary | undefined,
}

export function MappingStatus(props: MappingStatusProps) {
    if (!props.job) {
        return null;
    }
    const jobProps = getJobDisplayProps(props.job);
    const cssClass = jobProps.isFailed ? "govuk-error-summary-red" :
        jobProps.isSuccessful ? "govuk-error-summary-green" :
            jobProps.isActive ? "govuk-error-summary-orange" :
                "";

    return <div
        className={`govuk-error-summary ${cssClass}`}
        aria-labelledby="error-summary-title"
        role="alert"
        tabIndex={-1}
        data-module="govuk-error-summary"
        data-testid="job-notification">
        <h2 className="govuk-error-summary__title" id="error-summary-title">
            <span
                data-testid="job-notification-title">Job {jobProps.statusDescription}: {jobProps.jobDescription}</span>
            {jobProps.isActive &&
            <div className="loader loader-small" role="alert" aria-live="assertive"/>
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
                {jobProps.isComplete &&
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