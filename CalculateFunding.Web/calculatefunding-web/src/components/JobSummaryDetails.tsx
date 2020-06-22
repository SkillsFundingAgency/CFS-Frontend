import React, {useEffect, useState} from "react";
import {CompletionStatus, JobSummary, RunningStatus} from "../types/jobSummary";
import {DateFormatter} from "./DateFormatter";

export function JobSummaryDetails(props: {jobSummary: JobSummary, hidden?:boolean}) {
    const [jobSummary, setJobSummary] = useState(props.jobSummary);
    const [jobSummaryTitle, setJobSummaryTitle] = useState("");
    const [jobSummaryColour, setJobSummaryColour] = useState("");
    useEffect(() => {
        setJobSummary(props.jobSummary);
        if (props.jobSummary.runningStatus.toString().toLowerCase() === RunningStatus[RunningStatus.completed]) {
            setJobSummaryTitle("Calculation completed successfully");
            setJobSummaryColour("govuk-error-summary govuk-error-summary-green");
        }
        if (props.jobSummary.completionStatus == null || props.jobSummary.runningStatus.toString().toLowerCase() === RunningStatus[RunningStatus.inProgress]) {
            setJobSummaryTitle("Calculation in progress");
            setJobSummaryColour("govuk-error-summary govuk-error-summary-orange");
        }
        if (props.jobSummary.completionStatus != null && props.jobSummary.completionStatus.toString().toLowerCase() === CompletionStatus[CompletionStatus.failed]) {
            setJobSummaryTitle("Calculation failed");
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
                        date={jobSummary.created} utc={true}/>
                    </p>
                </li>
                <li hidden={jobSummary.completionStatus == null || jobSummary.runningStatus === RunningStatus.inProgress}>
                    <p className="govuk-body-s"><strong>Results updated:</strong> <DateFormatter
                        date={jobSummary.lastUpdated} utc={true}/></p>
                </li>
            </ul>
        </div>
    </div>
}