import React from "react";
import {ErrorMessage} from "../types/ErrorMessage";
import {LoadingFieldStatus} from "./LoadingFieldStatus";

export interface TextFieldProps {
    token: string,
    label: string,
    hint?: string,
    value: string | undefined,
    isLoading: boolean,
    errors: ErrorMessage[] | undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

export const TextField = ({
                              token,
                              label,
                              hint,
                              value,
                              isLoading,
                              errors,
                              onChange,
                          }: TextFieldProps) => {

    const hasErrors = !!errors?.length;

    return (
        <div className={`govuk-form-group ${hasErrors ? 'govuk-form-group--error' : ''}`}>
            <label className="govuk-label govuk-!-margin-bottom-2"
                   id={`text-${token}-label`}
                   htmlFor={`text-${token}`}
            >
                {label}
            </label>
            {isLoading && <LoadingFieldStatus title={"Loading..."} token={token}/>}
            {!isLoading &&
            <>
                {hint?.length &&
                <div>
                    <span id={`text-${token}-hint`}
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
                <input id={`text-${token}`}
                       type='text'
                       className={`govuk-input govuk-!-margin-bottom-2 ${hasErrors ? 'govuk-input--error' : ''}`}
                       name={`text-${token}`}
                       data-testid={`text-${token}`}
                       aria-labelledby={`text-${token}-label`}
                       aria-describedby={`text-${token}-hint`}
                       value={value || ''}
                       onChange={onChange}
                />
            </>
            }
        </div>
    )
};