import React from "react";
import {BackLink} from "./BackLink";

export interface TitleProps {
    title: string,
    titleCaption?: string,
    description?: string,
    children?: any,
    includeBackLink?: boolean
}

export function Title({title, description, titleCaption, children, includeBackLink = false}: TitleProps) {
    return (
        <>
            {includeBackLink &&
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <BackLink/>
                </div>
            </div>
            }
            <div className="govuk-grid-row govuk-!-margin-top-3"
                 data-testid="page-title">
                <hgroup className="govuk-grid-column-full">
                    <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
                        {title}
                        {titleCaption && <span className="govuk-caption-xl">{titleCaption}</span>}
                    </h1>
                    {description && <p className="govuk-body">{description}</p>}
                    {children}
                </hgroup>
            </div>
        </>
    )
}
