import React from "react";
import {JobMessage, JobSummary} from "../types/jobMessage";
import {DateFormatter} from "../components/DateFormatter";

export interface MappingStatusProps {
    jobMessage: JobMessage | JobSummary
}

export function MappingStatus({jobMessage}: MappingStatusProps) {
    let cssClass: string = "govuk-error-summary";
    let title: string = "";
    let subTitle: string = "";
    let completed: boolean = false;

    if (jobMessage.runningStatus === "Queued") {
        cssClass += " govuk-error-summary-orange";
        title = "Mapping queued"
    }

    if (jobMessage.runningStatus === "InProgress") {
        cssClass += " govuk-error-summary-orange";
        title = "Mapping in progress"
    }

    if (jobMessage.runningStatus === "Completed") {
        completed = true;
        if (jobMessage.completionStatus === "Succeeded") {
            cssClass += " govuk-error-summary-green";
            title = "Mapping completed";
        } else {
            title = "There is a problem";
            subTitle = "Mapping failed";
        }
    }

    const isJobSummary = "lastUpdated" in jobMessage;

    const jobCreatedDateTime = () => {
        let job;
        if (isJobSummary) {
            job = jobMessage as JobSummary;
            return <DateFormatter date={job.created} utc={false} />
        }
        job = jobMessage as JobMessage;
        return <DateFormatter date={job.jobCreatedDateTime} utc={false} />;
    }

    const jobStatusDateTime = () => {
        let job;
        if (isJobSummary) {
            job = jobMessage as JobSummary;
            return <DateFormatter date={job.lastUpdated} utc={false} />
        }
        job = jobMessage as JobMessage;
        return <DateFormatter date={job.statusDateTime} utc={false} />;
    }

    return <div className={cssClass} aria-labelledby="error-summary-title" role="alert"
        tabIndex={-1} data-module="govuk-error-summary" data-testid="job-notification">
        <h2 className="govuk-error-summary__title" id="error-summary-title">
            {title}
        </h2>
        {subTitle.length > 0 && <h3 id="subTitle" className="govuk-heading-m">{subTitle}</h3>}
        <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
                <li>
                    <p className="govuk-body">
                        {`Mapping initiated by ${jobMessage.invokerUserDisplayName} on `}
                        <span data-testid="formatted-created-date">{jobCreatedDateTime()}</span>
                    </p>
                </li>
                {completed && <li>
                    <p className="govuk-body-s"><strong>Completed: </strong>
                        <span data-testid="formatted-completed-date">{jobStatusDateTime()}</span>
                    </p>
                </li>}
            </ul>
        </div>
    </div>
}