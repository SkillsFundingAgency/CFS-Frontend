import React from "react";

import { BackLink } from "./BackLink";

export interface TitleProps {
  title: string;
  preTitleCaption?: string;
  titleCaption?: string;
  description?: string;
  css?: string;
  children?: any;
  includeBackLink?: boolean;
}

export function Title({
  title,
  description,
  preTitleCaption,
  titleCaption,
  children,
  css = "govuk-!-margin-top-0",
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
      <div className={`govuk-grid-row govuk-!-margin-bottom-4 ${css}`} data-testid="page-title">
        <hgroup className="govuk-grid-column-full">
          {preTitleCaption && (
            <span
              id="pre-title-caption"
              className="govuk-hint govuk-caption-s govuk-!-margin-top-2 govuk-!-margin-bottom-2"
            >
              {preTitleCaption}
            </span>
          )}
          <h1 id="title-header" className="govuk-heading-xl govuk-!-margin-bottom-2">
            {title}
          </h1>
          {titleCaption && (
            <h3 id="title-caption" className="govuk-caption-xl govuk-!-margin-top-2">
              {titleCaption}
            </h3>
          )}
          {description && (
            <p id="title-desc" className="govuk-body">
              {description}
            </p>
          )}
          {children}
        </hgroup>
      </div>
    </>
  );
}
