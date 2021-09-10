import * as React from "react";

/** @deprecated - pls use {@link LoadingStatusNotifier} instead */
export function LoadingStatus(props: {
  id?: string;
  title: string;
  subTitle?: string;
  description?: string;
  hidden?: boolean;
  testid?: string;
}) {
  return (
    <div id={props.id} className="govuk-grid-row" hidden={props.hidden} data-testid="loader">
      <div className="govuk-grid-column-full govuk-!-margin-top-9">
        <h2 className="govuk-heading-l center-align">{props.title}</h2>
        <h3 className="govuk-heading-m center-align">{props.subTitle}</h3>
        <div className="loader loader-full" role="alert" aria-live="assertive" />
        <p className="govuk-body center-align">{props.description}</p>
      </div>
    </div>
  );
}
