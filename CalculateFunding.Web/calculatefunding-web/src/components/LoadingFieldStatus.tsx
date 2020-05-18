import * as React from "react";

export function LoadingFieldStatus(props: { id?: string, title: string, hidden?: boolean }) {

    return (
        <div className={"loader-inline"} id={props.id}>
            <div hidden={props.hidden}>
                <div className="loader loader-small" role="alert" aria-live="assertive"></div>
                <div className={"loader-text govuk-body govuk-!-font-size-14"}>{props.title}</div>
            </div>
        </div>
    )
}