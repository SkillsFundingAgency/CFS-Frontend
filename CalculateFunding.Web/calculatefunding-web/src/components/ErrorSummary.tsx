import React from "react";

export function ErrorSummary(props: { title: string; error: string; suggestion: string }) {
  return (
    <div
      className="govuk-error-summary"
      aria-labelledby="error-summary-title"
      role="alert"
      tabIndex={-1}
      data-module="govuk-error-summary"
      hidden={props.title.length < 1}
    >
      <h2 className="govuk-error-summary__title" id="error-summary-title">
        {props.error}
      </h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          <li>{props.title}</li>
          <li>{props.suggestion}</li>
        </ul>
      </div>
    </div>
  );
}
