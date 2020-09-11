import React from "react";

export function BackToTop(props: {id: string, hidden?:boolean}){
    return <div className="app-back-to-top app-back-to-top--fixed govuk-!-margin-top-9 govuk-!-margin-bottom-3" data-module="app-back-to-top" hidden={props.hidden}>
        <a className="govuk-link govuk-link--no-visited-state app-back-to-top__link" href={`#${props.id}`}>
            <svg role="presentation" focusable="false" className="app-back-to-top__icon" xmlns="http://www.w3.org/2000/svg" width="13" height="17" viewBox="0 0 13 17">
                <path fill="currentColor" d="M6.5 0L0 6.5 1.4 8l4-4v12.7h2V4l4.3 4L13 6.4z"></path>
            </svg>
            Back to top
        </a>
    </div>
}