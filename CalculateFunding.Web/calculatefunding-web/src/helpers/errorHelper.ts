import { AxiosError } from "axios";

import { ErrorProps, ValidationErrorProps } from "../hooks/useErrors";
import { ErrorMessage, ValidationErrors } from "../types/ErrorMessage";

const findDuplicateError = (
  state: readonly ErrorMessage[],
  errorMessage: string | undefined,
  fieldName?: string | undefined,
  description?: string | undefined,
  suggestion?: string | undefined
) =>
  state &&
  state.find(
    (err) =>
      !err.validationErrors &&
      (err.description === description || (!description && !err.description)) &&
      (err.fieldName === fieldName || (!fieldName && !err.fieldName)) &&
      (err.message === errorMessage || (!errorMessage && !err.message)) &&
      (err.suggestion === suggestion || (!suggestion && !err.suggestion))
  );

const createErrorMessage = (
  state: readonly ErrorMessage[],
  errorMessage: any,
  description?: string,
  fieldName?: string,
  suggestion?: any
): ErrorMessage | undefined => {
  if (findDuplicateError(state, errorMessage, fieldName, description, suggestion)) {
    return;
  }

  const errorCount: number = state.length;

  return {
    id: errorCount + 1,
    fieldName: fieldName,
    description: description,
    suggestion: suggestion,
    message: errorMessage.toString(),
    validationErrors: undefined,
  };
};

const createError = (
  state: readonly ErrorMessage[],
  { error, description, fieldName, suggestion }: ErrorProps
) => {
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
  return createErrorMessage(
    state,
    errorMessage.length > 0 ? errorMessage : error.toString(),
    description,
    fieldName,
    suggestion
  );
};

const createSingleErrorFromValidationErrors = (
  state: readonly ErrorMessage[],
  { validationErrors, message, description, fieldName }: ValidationErrorProps
): ErrorMessage => {
  const errorCount: number = state.length;
  return {
    id: errorCount + 1,
    fieldName: fieldName,
    description: description,
    message: message,
    validationErrors: validationErrors,
  };
};

// flattens out validation errors into separate errors related to their relevant field names
const createValidationErrorsAsIndividualErrors = (
  state: readonly ErrorMessage[],
  validationErrors: ValidationErrors
): ErrorMessage[] | undefined => {
  if (!validationErrors) return;
  const errorCount: number = state.length;
  return Object.keys(validationErrors).flatMap((fieldName): ErrorMessage[] => {
    const fieldErrors = validationErrors[fieldName];
    return fieldErrors.map((fieldError) => {
      return {
        id: errorCount + 1,
        fieldName: fieldName,
        message: fieldError || "",
      } as ErrorMessage;
    });
  });
};

const combineError = (state: readonly ErrorMessage[], newError: ErrorMessage | undefined): ErrorMessage[] => {
  if (!newError) return state as ErrorMessage[];

  return [...state, newError];
};

const combineErrors = (
  state: readonly ErrorMessage[],
  newErrors: ErrorMessage[] | undefined
): ErrorMessage[] => {
  if (!newErrors?.length) return state as ErrorMessage[];

  return [...state, ...newErrors];
};

const clearErrorMessages = (state: readonly ErrorMessage[], fieldNames?: string[]): ErrorMessage[] => {
  if (state.length > 0) {
    if (!fieldNames) {
      return [] as ErrorMessage[];
    } else {
      return (
        state.filter((e) => !e.fieldName || (e.fieldName && !fieldNames.includes(e.fieldName))) ??
        ([] as ErrorMessage[])
      );
    }
  }

  return state as ErrorMessage[];
};

export const errorHelper = {
  findDuplicateError,
  createErrorMessage,
  createError,
  createSingleErrorFromValidationErrors,
  createValidationErrorsAsIndividualErrors,
  combineError,
  combineErrors,
  clearErrorMessages,
};
