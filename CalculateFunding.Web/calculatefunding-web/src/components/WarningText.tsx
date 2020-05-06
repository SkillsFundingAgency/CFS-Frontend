import React from "react";

export function WarningText(props: { text: string, hidden?:boolean }) {
    return <div className="govuk-warning-text" hidden={props.hidden}>
        <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
        <strong className="govuk-warning-text__text">
            <span className="govuk-warning-text__assistive">Warning</span>
            <span>{props.text}</span>
        </strong>
    </div>
}