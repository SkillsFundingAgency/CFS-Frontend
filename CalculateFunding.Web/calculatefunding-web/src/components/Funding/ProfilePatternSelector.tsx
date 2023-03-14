import React from "react";

import {
  AvailableVariationPointerFundingLine,
  Period,
} from "../../types/Publishing/AvailableVariationPointerFundingLine";

export default function ProfilePatternSelector(props: {
  profilePatternList: Period[];
  pointer: AvailableVariationPointerFundingLine | undefined;
  callback: any;
}) {
  const setVariationPointer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pointer = props.pointer;
    if (pointer) {
      props.callback(e.target.value, pointer);
    }
  };

  return (
    <select
      name={`variationPointerSelect-${props.pointer?.fundingLineCode}`}
      id={`variationPointerSelect-${props.pointer?.fundingLineCode}`}
      className="govuk-select govuk-!-width-full"
      onChange={(e) => setVariationPointer(e)}
    >
      <option key={-1} value=""></option>
      {props.profilePatternList &&
        props.profilePatternList.map((pp, index) => (
          <option key={index} value={`${pp.year}-${pp.period}-${pp.occurrence}`}>
            {pp.period} {pp.year} Instalment {pp.occurrence}
          </option>
        ))}
    </select>
  );
}
