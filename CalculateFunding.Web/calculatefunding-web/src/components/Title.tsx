import React from "react";

import { BackLink } from "./BackLink";

export interface TitleProps {
  title: string;
  preTitleCaption?: string;
  titleCaption?: string;
  description?: string;
  children?: any;
  includeBackLink?: boolean;
}

export function Title({
  title,
  description,
  preTitleCaption,
  titleCaption,
  children,
  includeBackLink = false,
}: TitleProps): JSX.Element {
  return (
    <>
      {includeBackLink && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <BackLink />
          </div>
        </div>
      )}
      <div className="govuk-grid-row govuk-!-margin-top-3 govuk-!-margin-bottom-2" data-testid="page-title">
        <hgroup className="govuk-grid-column-full">
          {preTitleCaption && (
            <span className="govuk-hint govuk-caption-s govuk-!-margin-top-2 govuk-!-margin-bottom-2">
              {preTitleCaption}
            </span>
          )}
          <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">{title}</h1>
          {titleCaption && <h3 className="govuk-caption-xl govuk-!-margin-top-2">{titleCaption}</h3>}
          {description && <p className="govuk-body">{description}</p>}
          {children}
        </hgroup>
      </div>
    </>
  );
}
