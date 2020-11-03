import * as React from "react";

export function LoadingFieldStatus(props: { id?: string, title: string, hidden?: boolean }) {

    return (
        <span className={"loader-inline"} id={props.id} data-testid="loader-inline">
            <span hidden={props.hidden}>
                <span className="loader loader-small" role="alert" aria-live="assertive"/>
                <span className={"loader-text govuk-body govuk-!-font-size-14"}>{props.title}</span>
            </span>
        </span>
    )
}