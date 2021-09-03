import { AxiosError } from "axios";
import * as React from "react";
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

interface ErrorHookResult {
  errors: ErrorMessage[];
  validate: (validationFn: () => boolean, errorSettings: ErrorProps) => boolean;
  addError: ({ error, description, fieldName, suggestion }: ErrorProps) => void;
  addErrorMessage: (
    errorMessage: any,
    description?: string,
    fieldName?: string,
    suggestion?: any
  ) => void;
  addValidationErrors: ({
    validationErrors,
    message,
    description,
    fieldName,
  }: ValidationErrorProps) => void;
  addValidationErrorsAsIndividualErrors: (props: {
    validationErrors: ValidationErrors;
  }) => void;
  clearErrorMessages: (fieldNames?: string[]) => void;
}

export const useErrors = (): ErrorHookResult => {
  const [errors, setErrors] = React.useState<ErrorMessage[]>([]);

  const addErrorMessage = (
    errorMessage: any,
    description?: string,
    fieldName?: string,
    suggestion?: any
  ) => {
    const isDuplicateError =
      errors &&
      errors.some(
        (err) =>
          !err.validationErrors &&
          (err.description === description ||
            (!description && !err.description)) &&
          (err.fieldName === fieldName || (!fieldName && !err.fieldName)) &&
          (err.message === errorMessage || (!errorMessage && !err.message)) &&
          (err.suggestion === suggestion || (!suggestion && !err.suggestion))
      );
    if (isDuplicateError) {
      return;
    }
    const errorCount: number = errors.length;
    const error: ErrorMessage = {
      id: errorCount + 1,
      fieldName: fieldName,
      description: description,
      suggestion: suggestion,
      message: errorMessage.toString(),
      validationErrors: undefined,
    };
    setErrors((errors) => [...errors, error]);
  };

  const validate = (
    validationFn: () => boolean,
    errorSettings: ErrorProps
  ): boolean => {
    if (!validationFn()) {
      addError(errorSettings);
      return false;
    }

    return true;
  };

  const addError = ({
    error,
    description,
    fieldName,
    suggestion,
  }: ErrorProps) => {
    let errorMessage = "";
    const axiosError = error as AxiosError;
    if (axiosError && axiosError.isAxiosError) {
      errorMessage =
        axiosError.response && axiosError.response.data
          ? axiosError.response.data
          : `Server returned ${axiosError.response?.status} ${axiosError.response?.statusText}`;
    } else {
      const err = error as Error;
      if (err && err.message) {
        errorMessage = err.message;
      }
    }
    addErrorMessage(
      errorMessage.length > 0 ? errorMessage : error.toString(),
      description,
      fieldName,
      suggestion
    );
  };

  const addValidationErrors = ({
    validationErrors,
    message,
    description,
    fieldName,
  }: ValidationErrorProps) => {
    const errorCount: number = errors.length;
    const errorMessage: ErrorMessage = {
      id: errorCount + 1,
      fieldName: fieldName,
      description: description,
      message: message,
      validationErrors: validationErrors,
    };
    setErrors((errors) => [...errors, errorMessage]);
  };

  // flattens out validation errors into separate errors related to their relevant field names
  const addValidationErrorsAsIndividualErrors = (props: {
    validationErrors: ValidationErrors;
  }) => {
    if (!props.validationErrors) return;
    const errorCount: number = errors.length;
    Object.keys(props.validationErrors).forEach((fieldName) => {
      const fieldErrors = props.validationErrors[fieldName];
      fieldErrors.forEach((fieldError) => {
        const errorMessage: ErrorMessage = {
          id: errorCount + 1,
          fieldName: fieldName,
          message: fieldError || "",
        };
        setErrors((errors) => [...errors, errorMessage]);
      });
    });
  };

  const clearErrorMessages = (fieldNames?: string[]) => {
    if (errors.length > 0) {
      if (!fieldNames) {
        setErrors([]);
      } else {
        setErrors(
          errors.filter(
            (e) =>
              !e.fieldName || (e.fieldName && !fieldNames.includes(e.fieldName))
          )
        );
      }
    }
  };

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
