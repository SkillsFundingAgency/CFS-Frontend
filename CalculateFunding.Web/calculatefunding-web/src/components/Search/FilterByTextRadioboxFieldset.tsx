import * as React from "react";

import { FilterByTextRadioboxOption } from "./FilterByTextRadioboxOption";
import { FilterOptionProps } from "./FilterCheckboxOption";

export interface FilterByTextRadioboxFieldsetProps {
  fieldLabelText: string | null;
  fieldId: string;
  options: FilterOptionProps[];
  onSelectedHandler?: (optionName: string) => void;
  onChangeHandler: (optionName: string, searchText: string) => void;
}

export function FilterByTextRadioboxFieldset({
  fieldId,
  fieldLabelText,
  options,
  onSelectedHandler,
  onChangeHandler,
}: FilterByTextRadioboxFieldsetProps) {
  return (
    <>
      {options.map((option, index) => (
        <FilterByTextRadioboxOption
          key={index}
          {...{ ...option, fieldId, onSelectedHandler, onChangeHandler }}
        />
      ))}
      ;
    </>
  );
}
