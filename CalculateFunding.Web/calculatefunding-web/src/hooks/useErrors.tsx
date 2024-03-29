﻿import { AxiosError } from "axios";
import * as React from "react";

import { errorHelper } from "../helpers/errorHelper";
import { ErrorMessage, ValidationErrors } from "../types/ErrorMessage";

export interface ErrorProps extends BaseErrorProps {
  error: AxiosError | Error | string;
}

export interface ValidationErrorProps extends BaseErrorProps {
  message: string;
  validationErrors: ValidationErrors;
}

interface BaseErrorProps {
  description?: string;
  fieldName?: string;
  suggestion?: any;
}

export interface ErrorHookResult {
  errors: ErrorMessage[];
  validate: (validationFn: () => boolean, errorSettings: ErrorProps) => boolean;
  addError: ({ error, description, fieldName, suggestion }: ErrorProps) => void;
  addErrorMessage: (errorMessage: any, description?: string, fieldName?: string, suggestion?: any) => void;
  addValidationErrors: ({ validationErrors, message, description, fieldName }: ValidationErrorProps) => void;
  addValidationErrorsAsIndividualErrors: (props: { validationErrors: ValidationErrors }) => void;
  clearErrorMessages: (fieldNames?: string[]) => void;
}

// N.B. - all logic should be in the errorHelper as it will be shared between this hook and the ErrorContext
// The ErrorContext / useErrorContext may eventually replace this hook as works better with child components
export const useErrors = (): ErrorHookResult => {
  const [errors, setErrors] = React.useState<ErrorMessage[]>([]);

  const addErrorToState = (newError: ErrorMessage | undefined) =>
    setErrors((curr) => errorHelper.combineError(curr, newError));

  const addErrorsToState = (newErrors: ErrorMessage[] | undefined) =>
    setErrors((curr) => errorHelper.combineErrors(curr, newErrors));

  /** @deprecated - pls use {@link addError} instead */
  const addErrorMessage = (errorMessage: any, description?: string, fieldName?: string, suggestion?: any) =>
    addErrorToState(errorHelper.createErrorMessage(errors, errorMessage, description, fieldName, suggestion));

  const validate = (validationFn: () => boolean, errorSettings: ErrorProps): boolean => {
    if (!validationFn()) {
      addError(errorSettings);
      return false;
    }

    return true;
  };

  const addError = (errorDetails: ErrorProps) =>
    addErrorToState(errorHelper.createError(errors, errorDetails));

  const addValidationErrors = (validationErrors: ValidationErrorProps) =>
    addErrorToState(errorHelper.createSingleErrorFromValidationErrors(errors, validationErrors));

  // flattens out validation errors into separate errors related to their relevant field names
  const addValidationErrorsAsIndividualErrors = (props: { validationErrors: ValidationErrors }) =>
    addErrorsToState(errorHelper.createValidationErrorsAsIndividualErrors(errors, props.validationErrors));

  const clearErrorMessages = (fieldNames?: string[]) =>
    setErrors(errorHelper.clearErrorMessages(errors, fieldNames));

  return {
    errors,
    validate,
    addError,
    addErrorMessage,
    addValidationErrors,
    addValidationErrorsAsIndividualErrors,
    clearErrorMessages,
  };
};
