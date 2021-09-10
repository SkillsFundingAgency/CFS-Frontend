import React from "react";

import { ErrorMessage } from "../types/ErrorMessage";

export interface InlineErrorProps {
  fieldName: string;
  errors: ErrorMessage[];
}

export function InlineError(props: InlineErrorProps) {
  return (
    <div hidden={props.errors.some((e) => e.fieldName === props.fieldName)}>
      {props.errors
        .filter((e) => e.fieldName === props.fieldName)
        .map((error, index) => (
          <span id={`${props.fieldName}-error`} key={index} className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span>
            {error.description && error.description.length > 0 ? error.description : "Error"}:{error.message}
          </span>
        ))}
    </div>
  );
}
