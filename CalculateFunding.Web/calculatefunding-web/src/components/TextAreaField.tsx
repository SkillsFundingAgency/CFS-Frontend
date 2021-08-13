import React from "react";
import {ErrorMessage} from "../types/ErrorMessage";
import {LoadingFieldStatus} from "./LoadingFieldStatus";

export interface TextAreaFieldProps {
    token: string,
    label: string,
    hint?: string,
    rows?: number,
    value: string | undefined,
    isLoading: boolean,
    errors: ErrorMessage[] | undefined,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
}

export const TextAreaField = ({
                                  token,
                                  label,
                                  hint,
                                  value,
                                  rows,
                                  isLoading,
                                  errors,
                                  onChange,
                              }: TextAreaFieldProps) => {

    const hasErrors = !!errors?.length;

    return (
        <div className={`govuk-form-group ${hasErrors ? 'govuk-form-group--error' : ''}`}>
            <label className="govuk-label govuk-!-margin-bottom-2"
                   htmlFor={`textarea-${token}`}
            >
                {label}
            </label>
            {isLoading && <LoadingFieldStatus title={"Loading..."} token={token}/>}
            {!isLoading &&
            <>
                {hint?.length &&
                <div>
                    <span id={`textarea-${token}-hint`}
                          className="govuk-hint govuk-!-margin-bottom-2"
                    >
                        {hint}
                    </span>
                </div>
                }
                {hasErrors && errors?.map(error =>
                    <span key={error.id}
                          className="govuk-error-message govuk-!-margin-bottom-2"
                          role="alert"
                          aria-live="assertive"
                    >
                        <span className="govuk-visually-hidden">
                            Error:
                        </span>
                        {' '}
                        {error.message}
                    </span>)
                }
                <textarea
                    id={`textarea-${token}`}
                    className={`govuk-textarea govuk-!-margin-bottom-2 ${hasErrors ? 'govuk-textarea--error' : ''}`}
                    rows={rows ? rows : 8}
                    name={`textarea-${token}`}
                    data-testid={`textarea-${token}`}
                    aria-describedby={`textarea-${token}-hint`}
                    value={value || ''}
                    onChange={onChange}
                />
            </>
            }
        </div>
    )
};