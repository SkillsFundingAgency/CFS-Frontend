import * as React from "react";
import {FilterOptionProps} from "./FilterCheckboxOption";


export interface FilterByTextOptionProps extends FilterOptionProps {
    searchText?: string,
}

export interface FilterByTextOptionInputProps extends FilterByTextOptionProps {
    fieldId: string,
    onSelectedHandler?: (optionName: string) => void,
    onChangeHandler: (optionName: string, searchText: string) => void,
}

export function FilterByTextRadioboxOption({value, index, searchText, isSelected, fieldId, onSelectedHandler, onChangeHandler, id = `${fieldId}-${value}`, labelText = value}: FilterByTextOptionInputProps) {
    return (
        <div key={index} className="govuk-radios__item">
            <div className="govuk-radios__conditional">
                <input type="radio"
                       id={id}
                       name={id}
                       className="govuk-radios__input"
                       aria-expanded="true"
                       checked={isSelected}
                       value={value}
                       onChange={() => onSelectedHandler && onSelectedHandler(value)}/>
                <label className="govuk-label govuk-radios__label"
                       onClick={() => onSelectedHandler && onSelectedHandler(value)}
                       htmlFor={id}>
                    {labelText}
                </label>
            </div>
            <div className={`govuk-radios__conditional ${isSelected ? "" : "govuk-radios__conditional--hidden"}`}>
                <div className="govuk-form-group">
                    <input type="text"
                           id={`${id}-search-text`}
                           value={searchText}
                           className="govuk-input sidebar-search-input"
                           onChange={(e) => onChangeHandler(value, e.target.value)}/>
                </div>
            </div>
        </div>
    )
}

