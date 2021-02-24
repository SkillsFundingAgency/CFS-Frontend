import * as React from "react";
import {convertToSlug} from "../../helpers/stringHelper";

export interface FilterOptionProps {
    id?: string,
    index: string | number,
    value: string,
    searchText?: string,
    labelText?: string,
    isSelected: boolean
}

export interface FilterOptionInputProps extends FilterOptionProps {
    fieldId: string,
    onChangeHandler: (value: string, isSelected: boolean) => void,
}

export function FilterCheckboxOption({value, index, fieldId, isSelected, onChangeHandler, labelText = value, id = `${fieldId}-${convertToSlug(value)}`}: FilterOptionInputProps) {
    return (
        <div key={index} className="govuk-checkboxes__item">
            <input className="govuk-checkboxes__input"
                   id={id}
                   name={id}
                   type="checkbox"
                   checked={isSelected}
                   value={value}
                   onChange={() => onChangeHandler(value, !isSelected)}/>
            <label className="govuk-label govuk-checkboxes__label"
                   htmlFor={id}>
                {labelText}
            </label>
        </div>)
}

