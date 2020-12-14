import { AxiosError } from "axios";
import * as React from "react";
import {ErrorMessage, ValidationErrors} from "../types/ErrorMessage";

export const useErrors = () => {
    const [errors, setErrors] = React.useState<ErrorMessage[]>([]);

    const addErrorMessage = (errorMessage: any, description?: string, fieldName?: string, suggestion?: any) => {
        const isDuplicateError = errors && errors.some(err => err.description === description && err.fieldName === fieldName && err.message === errorMessage);
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
            validationErrors: undefined
        };
        setErrors(errors => [...errors, error]);
    };
    
    const addError = (error: AxiosError | Error | string, description?: string, fieldName?: string) => {
        let errorMessage = "";
        const axiosError = (error as AxiosError);
        if (axiosError && axiosError.isAxiosError) {
            errorMessage = axiosError.response && axiosError.response.data ? axiosError.response.data : `Server returned ${axiosError.response?.status} ${axiosError.response?.statusText}`;
        }
        const err = error as Error;
        if (err && err.message) {
            errorMessage = err.message;
        }
        addErrorMessage(errorMessage.length > 0 ? errorMessage : error.toString(), description, fieldName);
    };
    
    const addValidationErrors = (validationErrors: ValidationErrors, message: string, description?: string, fieldName?: string) => {
        const errorCount: number = errors.length;
        const errorMessage: ErrorMessage = {
            id: errorCount + 1,
            fieldName: fieldName,
            description: description,
            message: message,
            validationErrors: validationErrors
        };
        setErrors(errors => [...errors, errorMessage]);
    };

    const clearErrorMessages = (fieldNames?: string[]) => {
        if (errors.length > 0) {
            if (!fieldNames) {
                setErrors([]);
            } else {
                setErrors(errors.filter(e => !e.fieldName || (e.fieldName && !fieldNames.includes(e.fieldName))));
            }
        }
    };

    return {
        errors,
        addError,
        addErrorMessage,
        addValidationErrors,
        clearErrorMessages
    }
}