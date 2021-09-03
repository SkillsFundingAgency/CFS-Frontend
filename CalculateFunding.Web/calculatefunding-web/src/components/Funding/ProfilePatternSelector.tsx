import React from "react";
import {
    FundingStreamPeriodProfilePattern
} from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import {
    AvailableVariationPointerFundingLine,
    Period
} from "../../types/Publishing/AvailableVariationPointerFundingLine";

export default function ProfilePatternSelector(props: { profilePatternList: Period[], pointer: AvailableVariationPointerFundingLine | undefined, callback: any }) {
    const setVariationPointer = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pointer = props.pointer;
        if (pointer) {
           props.callback(e.target.value, pointer);
        }
    }

    return <select name="variationPointerSelect" id="variationPointerSelect" className="govuk-select"  onChange={(e) => setVariationPointer(e)}>
        <option key={-1} value=""></option>
        {props.profilePatternList && props.profilePatternList.map((pp, index) => <option key={index}
                                                                                         value={`${pp.year}-${pp.period}-${pp.occurrence}`}
                                                                                        >{pp.period} {pp.year} Installment {pp.occurrence}</option>)}
    </select>
}
