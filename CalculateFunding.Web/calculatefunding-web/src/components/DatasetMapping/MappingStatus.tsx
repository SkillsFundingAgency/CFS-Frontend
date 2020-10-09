import React from "react";
import {DateFormatter} from "../DateFormatter";
import {JobSummary} from "../../types/jobSummary";
import {RunningStatus} from "../../types/RunningStatus";
import {CompletionStatus} from "../../types/CompletionStatus";
import {getJobProgressMessage} from "../../helpers/getJobProgressMessage";

export interface MappingStatusProps {
    job: JobSummary | undefined,
    hasActiveJob: boolean,
}

export function MappingStatus(props: MappingStatusProps) {
    let cssClass: string = "govuk-error-summary";
    let title: string = "";
    let mappingTo: string = "";
    let subTitle: string = "";
    let completed: boolean = false;

    if (!props.job) {
        return null;
    }
    const jobDescription = getJobProgressMessage(props.job);
    
    if (props.job.runningStatus === RunningStatus.Queued) {
        cssClass += " govuk-error-summary-orange";
        title = jobDescription + " job queued"
    }

    if (props.job.runningStatus === RunningStatus.InProgress) {
        cssClass += " govuk-error-summary-orange";
        title = jobDescription + " job in progress"
    }

    if (props.job.runningStatus === RunningStatus.Completed) {
        completed = true;
        if (props.job.completionStatus === CompletionStatus.Succeeded) {
            cssClass += " govuk-error-summary-green";
            title = jobDescription + " job completed";
        } else {
            cssClass += " govuk-error-summary-red";
            title = `There is a problem with the ${jobDescription} job`;
            subTitle = jobDescription + " job failed";
        }
    }


    return <div className={cssClass} aria-labelledby="error-summary-title" role="alert" tabIndex={-1} data-module="govuk-error-summary" data-testid="job-notification">
        <h2 className="govuk-error-summary__title" id="error-summary-title">
            <span data-testid="job-notification-title">{title}</span>
            {props.hasActiveJob &&
            <div className="loader loader-small" role="alert" aria-live="assertive"/>
            }
        </h2>
        {subTitle.length > 0 && <h3 id="subTitle" className="govuk-heading-m">{subTitle}</h3>}
        <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
                <li>
                    <p className="govuk-body">
                        {`Mapping initiated by ${props.job.invokerUserDisplayName} on `}
                        <span data-testid="formatted-created-date"><DateFormatter date={props.job.created as Date} utc={false} /></span>
                    </p>
                </li>
                {completed && 
                <li>
                    <p className="govuk-body-s">
                        <strong>Completed: </strong>
                        <span data-testid="formatted-completed-date">
                            <DateFormatter date={props.job.lastUpdated as Date} utc={false} />
                        </span>
                    </p>
                </li>}
            </ul>
        </div>
    </div>
}