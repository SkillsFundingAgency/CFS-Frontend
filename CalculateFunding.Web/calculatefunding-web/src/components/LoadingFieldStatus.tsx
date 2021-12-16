import * as React from "react";

export function LoadingFieldStatus(props: { id?: string; title: string; hidden?: boolean; token?: string }) {
  return (
    <span
      className="loader-inline"
      id={props.id}
      role="alert"
      aria-label={props.title}
      data-testid={`loader-inline${props.token?.length ? "-" + props.token : ""}`}
    >
      <span hidden={props.hidden}>
        <span className="loader loader-small" aria-live="assertive" />
        <span className="loader-text govuk-body govuk-!-font-size-14">{props.title}</span>
      </span>
    </span>
  );
}
