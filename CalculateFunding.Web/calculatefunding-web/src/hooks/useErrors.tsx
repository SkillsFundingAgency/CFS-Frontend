import * as React from "react";
import {ErrorMessage} from "../types/ErrorMessage";

export const useErrors = () => {
    const [errors, setErrors] = React.useState<ErrorMessage[]>([]);

    const addErrorMessage = (errorMessage: any, description?: string, fieldName?: string) => {
        const isDuplicateError = errors && errors.some(err => err.description === description && err.fieldName === fieldName && err.message === errorMessage);
        if (isDuplicateError) {
            return;
        }
        const errorCount: number = errors.length;
        const error: ErrorMessage = {
            id: errorCount + 1,
            fieldName: fieldName,
            description: description,
            message: errorMessage.toString()
        };
        setErrors(errors => [...errors, error]);
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
        addErrorMessage,
        clearErrorMessages
    }
}