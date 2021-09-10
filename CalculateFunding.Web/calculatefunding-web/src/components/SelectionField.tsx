import React from "react";

import { ErrorMessage } from "../types/ErrorMessage";
import { LoadingFieldStatus } from "./LoadingFieldStatus";

export interface SelectionFieldOption {
  id: string;
  displayValue: string;
}

export interface SelectionFieldProps {
  token: string;
  label: string;
  hint?: string;
  selectedValue: string | undefined;
  options: SelectionFieldOption[] | undefined;
  isLoading: boolean;
  errors: ErrorMessage[] | undefined;
  changeSelection: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectionField = ({
  token,
  label,
  hint,
  selectedValue,
  options,
  isLoading,
  errors,
  changeSelection,
}: SelectionFieldProps) => {
  const hasErrors = !!errors?.length;

  return (
    <div className={`govuk-form-group ${hasErrors ? "govuk-form-group--error" : ""}`}>
      <label className="govuk-label govuk-!-margin-bottom-2" htmlFor={`select-${token}`}>
        {label}
      </label>
      {isLoading && <LoadingFieldStatus title={"Loading..."} token={token} />}
      {!isLoading && options && (
        <>
          {hint?.length && (
            <div>
              <span id={`select-${token}-hint`} className="govuk-hint govuk-!-margin-bottom-2">
                {hint}
              </span>
            </div>
          )}
          {hasErrors &&
            errors?.map((error) => (
              <span
                key={error.id}
                className="govuk-error-message govuk-!-margin-bottom-2"
                role="alert"
                aria-live="assertive"
              >
                <span className="govuk-visually-hidden">Error:</span> {error.message}
              </span>
            ))}
          <select
            id={`select-${token}`}
            className={`govuk-select govuk-!-margin-bottom-2 ${hasErrors ? "govuk-select--error" : ""}`}
            name={`select-${token}`}
            data-testid={`select-${token}`}
            aria-describedby={`select-${token}-hint`}
            value={selectedValue}
            onChange={changeSelection}
          >
            <option key={-1} value="">
              Please select
            </option>
            {options.map((option, index) => (
              <option key={index} value={option.id}>
                {option.displayValue}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};
