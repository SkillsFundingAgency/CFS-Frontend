import React from "react";

export const FilterAllocationType = (props: {callback:any}) =>{
    return <div className="govuk-radios govuk-radios--inline">
        <div className="govuk-radios__item">
            <input className="govuk-radios__input"
                   id="set-allocation-show"
                   name="set-allocation"
                   type="radio"
                   value="true"
                   onChange={() => props.callback("Show all allocation types")}/>
            <label className="govuk-label govuk-radios__label"
                   htmlFor="set-allocation-show">
                Show all allocation types
            </label>
        </div>
        <div className="govuk-radios__item">
            <input className="govuk-radios__input"
                   id="set-allocation-hide"
                   name="set-allocation"
                   type="radio"
                   value="true"
                   onChange={() => props.callback("Hide indicative allocations")}/>
            <label className="govuk-label govuk-radios__label"
                   htmlFor="set-allocation-hide">
                Hide indicative allocations
            </label>
        </div>
        <div className="govuk-radios__item">
            <input className="govuk-radios__input"
                   id="set-allocation-only"
                   name="set-allocation"
                   type="radio"
                   value="true"
                   onChange={() => props.callback("Only indicative allocations")}/>
            <label className="govuk-label govuk-radios__label"
                   htmlFor="set-allocation-only">
                Only indicative allocations
            </label>
        </div>
    </div>
}
