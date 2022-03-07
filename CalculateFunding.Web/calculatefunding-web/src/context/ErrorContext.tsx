import React, { useEffect } from "react";

import { errorHelper } from "../helpers/errorHelper";
import { ErrorProps, ValidationErrorProps } from "../hooks/useErrors";
import { ErrorMessage } from "../types/ErrorMessage";

export type Action =
  | { type: "addError"; payload: ErrorProps }
  | { type: "addValidationError"; payload: ValidationErrorProps }
  | { type: "clearErrors"; payload: string[] | undefined };

export const errorContextEventReducer = (state: ErrorMessage[], action: Action): ErrorMessage[] => {
  switch (action.type) {
    case "addError": {
      return errorHelper.combineError(state, errorHelper.createError(state, action.payload));
    }
    case "addValidationError": {
      return errorHelper.combineError(
        state,
        errorHelper.createSingleErrorFromValidationErrors(state, action.payload)
      );
    }
    case "clearErrors": {
      return errorHelper.clearErrorMessages(state, action.payload);
    }
  }
};

export interface ErrorContextProps {
  state: ErrorMessage[];
  dispatch: (action: Action) => void;
  addErrorToContext: (err: ErrorProps) => void;
  addValidationErrorToContext: (err: ValidationErrorProps) => void;
  clearErrorsFromContext: (fieldNames?: string[] | undefined) => void;
}

export const ErrorContext = React.createContext<ErrorContextProps | undefined>(undefined);

export const ErrorContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(errorContextEventReducer, [] as ErrorMessage[]);

  const contextValue = React.useMemo(() => {
    const addErrorToContext = (err: ErrorProps) => dispatch({ type: "addError", payload: err });

    const addValidationErrorToContext = (err: ValidationErrorProps) =>
      dispatch({
        type: "addValidationError",
        payload: err,
      });

    const clearErrorsFromContext = (fieldNames?: string[] | undefined) =>
      dispatch({
        type: "clearErrors",
        payload: fieldNames,
      });

    return { state, dispatch, addErrorToContext, addValidationErrorToContext, clearErrorsFromContext };
  }, [state, dispatch]);

  return <ErrorContext.Provider value={contextValue}>{children}</ErrorContext.Provider>;
};

export const useErrorContext = () => {
  const context = React.useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useErrorContext must be used within an ErrorContext Provider");
  }

  // clear up on unmount
  useEffect(() => {
    console.log("useErrorContext: unmounting: context.clearErrorsFromContext()");
    return () => context.clearErrorsFromContext();
  }, []);

  return { ...context };
};
