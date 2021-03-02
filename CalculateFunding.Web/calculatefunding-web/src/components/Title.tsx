import React from "react";
import {BackLink} from "./BackLink";

export interface TitleProps {
    title: string,
    description?: string,
    includeBackLink?: boolean
}

export function Title({title, description, includeBackLink = false}: TitleProps) {
    return (
        <>
            {includeBackLink &&
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <BackLink/>
                </div>
            </div>
            }
            <div className="govuk-grid-row govuk-!-margin-top-3">
                <hgroup className="govuk-grid-column-two-thirds">
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{title}</h1>
                    <p className="govuk-body">{description}</p>
                </hgroup>
            </div>
        </>
    )
}