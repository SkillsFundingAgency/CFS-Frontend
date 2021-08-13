import React from "react";

export interface RadioOptionProps {
    token: string,
    label: string,
    value: string,
    hint?: string,
    checked: boolean,
    disabled?: boolean,
    callback: () => void
}

const RadioOption = ({
                         token,
                         label,
                         hint,
                         value,
                         checked,
                         disabled,
                         callback
                     }: RadioOptionProps) => {
    return (
        <div className="govuk-radios__item">
            <input className="govuk-radios__input"
                   id={`${token}-data`}
                   name={`${token}-data`}
                   type="radio"
                   checked={checked}
                   disabled={disabled === true}
                   value={value}
                   onChange={callback}
                   aria-describedby={`${token}-data-hint`}/>
            <label id={`${token}-data-label`}
                   className="govuk-label govuk-radios__label"
                   htmlFor={`${token}-data`}>
                {label}
            </label>
            {hint?.length &&
            <div id={`${token}-data-hint`} className="govuk-hint govuk-radios__hint">
                {hint}
            </div>
            }
        </div>
    );
}

export default RadioOption;