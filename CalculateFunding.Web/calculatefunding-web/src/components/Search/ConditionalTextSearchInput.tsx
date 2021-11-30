import * as React from "react";

export interface ConditionalTextSearchInputProps {
  fieldName: string;
  labelText: string;
  value?: string;
  handleChange: (fieldName: string, searchText: string) => void;
}

export function ConditionalTextSearchInput({
  fieldName,
  labelText,
  value,
  handleChange,
}: ConditionalTextSearchInputProps) {
  return (
    <div className="govuk-radios__conditional">
      <div className="govuk-form-group">
        <input
          type="text"
          className="govuk-input sidebar-search-input"
          id={fieldName}
          value={value}
          aria-label={labelText}
          onChange={(e) => handleChange(fieldName, e.target.value)}
        />
      </div>
    </div>
  );
}
