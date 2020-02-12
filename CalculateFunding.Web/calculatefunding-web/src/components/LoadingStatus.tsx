import * as React from "react";

export function LoadingStatus(props: { id?: string, title: string, subTitle?: string, description?: string, hidden?: boolean }) {

    return (
        <div id={props.id} className="govuk-grid-row" hidden={props.hidden}>
            <div className="govuk-grid-column-full govuk-!-margin-top-9">
                <h2 className="govuk-heading-l center-align">{props.title}</h2>
                <h3 className="govuk-heading-m center-align">{props.subTitle}</h3>
                <div className="loader loader-full" role="alert" aria-live="assertive"></div>
                <p className="govuk-body center-align">{props.description}</p>
            </div>
        </div>
    )
}