import React, {useEffect, useState} from "react";
import {JobSummary} from "../types/jobSummary";
import {DateFormatter} from "./DateFormatter";
import {RunningStatus} from "../types/RunningStatus";
import {CompletionStatus} from "../types/CompletionStatus";

export function JobSummaryDetails(props: {jobSummary: JobSummary, hidden?:boolean}) {
    const [jobSummary, setJobSummary] = useState(props.jobSummary);
    const [jobSummaryTitle, setJobSummaryTitle] = useState("");
    const [jobSummaryColour, setJobSummaryColour] = useState("");

    useEffect(() => {
        if (!props.jobSummary.runningStatus) return;
        setJobSummary(props.jobSummary);
        if (props.jobSummary.runningStatus === RunningStatus.Completed &&
                props.jobSummary.completionStatus === CompletionStatus.Succeeded) {
            setJobSummaryTitle("Calculation completed successfully");
            setJobSummaryColour("govuk-error-summary govuk-error-summary-green");
        }
        if (props.jobSummary.runningStatus === RunningStatus.InProgress) {
            setJobSummaryTitle("Calculation in progress");
            setJobSummaryColour("govuk-error-summary govuk-error-summary-orange");
        }
        if (props.jobSummary.completionStatus && props.jobSummary.completionStatus === CompletionStatus.Failed) {
            setJobSummaryTitle("Calculation failed");
            setJobSummaryColour("govuk-error-summary");
        }
        if (props.jobSummary.completionStatus && props.jobSummary.completionStatus === CompletionStatus.TimedOut) {
            setJobSummaryTitle("Calculation timed out");
            setJobSummaryColour("govuk-error-summary");
        }
        if (props.jobSummary.completionStatus && props.jobSummary.completionStatus === CompletionStatus.Cancelled) {
            setJobSummaryTitle("Calculation cancelled");
            setJobSummaryColour("govuk-error-summary");
        }
    }, [props.jobSummary]);

    return <div hidden={props.hidden}
                className={jobSummaryColour}
                aria-labelledby="error-summary-title" role="alert"
                data-module="govuk-error-summary">
        <h2 className="govuk-error-summary__title">
            {jobSummaryTitle}
        </h2>
        <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
                <li>
                    <p className="govuk-body">
                        Calculation initiated by&nbsp;{jobSummary.invokerUserDisplayName}&nbsp;on&nbsp;<DateFormatter
                        date={jobSummary.created as Date} utc={true}/>
                    </p>
                </li>
                <li hidden={jobSummary.completionStatus == null || jobSummary.runningStatus === RunningStatus.InProgress}>
                    <p className="govuk-body-s"><strong>Results updated:</strong> <DateFormatter
                        date={jobSummary.lastUpdated as Date} utc={true}/></p>
                </li>
            </ul>
        </div>
    </div>
}