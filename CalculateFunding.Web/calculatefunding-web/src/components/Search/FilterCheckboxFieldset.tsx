import * as React from "react";
import {FilterCheckboxOption, FilterOptionProps} from "./FilterCheckboxOption";

export interface FilterCheckboxFieldsetProps {
    fieldLabelText?: string,
    fieldId: string,
    options: FilterOptionProps[]
    onChangeHandler: (value: string, isSelected: boolean) => void,
}

export function FilterCheckboxFieldset({fieldId, fieldLabelText, options, onChangeHandler}: FilterCheckboxFieldsetProps) {
    return (
        <fieldset className="govuk-fieldset" id={fieldId} aria-describedby={`${fieldId}-label`}>
            {fieldLabelText && fieldLabelText.length > 0 &&
            <legend className="govuk-label" id={`${fieldId}-label`}>
                {fieldLabelText}
            </legend>}
            <div className="govuk-checkboxes govuk-checkboxes--small filterbyCheckbox">
                {options.map((option, index) =>
                    <FilterCheckboxOption key={index} {...{...option, fieldId, onChangeHandler}} />)}
            </div>
        </fieldset>
    );
}