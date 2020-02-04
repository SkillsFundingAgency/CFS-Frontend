import React, {useEffect, useState} from 'react';

export function TimeInput(props: { time:string, callback: any, inputName?: string }) {
    const [localTime, setTime] = useState(props.time);
    const propTime = props.time;
    const inputId = props.inputName == null? generateRandomId() : props.inputName;

    useEffect(() => {
        setTime(propTime);
        props.callback(propTime);
    }, [propTime]);

    function generateRandomId ()
    {
        return Math.random().toString(36).substr(2);
    }

    function changeTime(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.value.length > 0) {
            setTime(e.target.value);
            props.callback(e.target.value);
        }
    }

    return (
        <>
        <label className="govuk-label govuk-date-input__label" htmlFor={inputId}>Time</label>
        <input className="govuk-input govuk-date-input__input govuk-input--width-4" type="time" min="00:00" max="23:59"
               value={localTime}
               id={inputId}
               name={inputId}
               onChange={(e) => changeTime(e)} />
        </>
    )
}