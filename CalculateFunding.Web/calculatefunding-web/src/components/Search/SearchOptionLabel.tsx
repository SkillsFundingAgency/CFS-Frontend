import * as React from "react";

export interface SearchOptionLabelProps {
  fieldName: string;
  labelText: string;
  isSelected: boolean;
  handleFocus: (fieldName: string) => void;
}

export function SearchOptionLabel({ fieldName, labelText, isSelected, handleFocus }: SearchOptionLabelProps) {
  const id = `search-option-${fieldName}`;
  const onFocus = () => handleFocus(fieldName);
  return (
    <div className="govuk-radios__item">
      <input
        onChange={onFocus}
        className="govuk-radios__input"
        id={id}
        name={id}
        type="radio"
        checked={isSelected}
        aria-controls={`conditional-search-options-${fieldName}`}
        aria-expanded={isSelected}
      ></input>
      <label onClick={onFocus} className="govuk-label govuk-radios__label" htmlFor={id}>
        {labelText}
      </label>
    </div>
  );
}
