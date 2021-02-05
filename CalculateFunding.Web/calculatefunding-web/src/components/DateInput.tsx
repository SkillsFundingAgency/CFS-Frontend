import React, {useEffect, useState} from 'react';
import {DateTime} from "luxon";

export function DateInput(props: { date: Date, callback: any, inputName?: string }) {
    const inputId = props.inputName == null ? generateRandomId() : props.inputName;
    const propDate = props.date;
    const [date, setDate] = useState<string>(getDateString(props.date));

    const [dateIsValid, setDateIsValid] = useState<boolean>(true);

    useEffect(() => {
        setDate(getDateString(props.date));
        props.callback(propDate);
    }, [propDate]);


    function getDateString (dateIn: Date)
    {
        return dateIn.getFullYear() !== DateTime.fromMillis(0).year ? dateIn.toISOString().substr(0,10) : "";
    }

    function generateRandomId() {
        return Math.random().toString(36).substr(2);
    }

    function setDateTime(day: string) {
        if (!isNaN(Date.parse(day)))
        {
            const newDate = DateTime.fromISO(day, {zone: 'utc'});
            const updatedDate: Date = newDate.toJSDate();
            setDate(getDateString(updatedDate));
            if (updatedDate !== undefined && !isNaN(updatedDate.getDate())) {
                props.callback(updatedDate);
                setDateIsValid(true);
            } else {
                setDateIsValid(false);
            }
        }
    }

    function checkDate() {
        const currentDate = DateTime.fromISO(date);

        if (currentDate.equals(DateTime.fromSeconds(0))) {
            setDateIsValid(false);
        }
    }

    return (
        <div className={"govuk-form-group" + (dateIsValid ? "" : " govuk-form-group--error")}>
            <fieldset className={"govuk-fieldset govuk-!-margin-top-5"} role="group" aria-describedby={`timeInputFieldset-${inputId}`}>
                <div className="govuk-date-input">
                    <div className="govuk-date-input__item">
                        <div className="govuk-form-group">
                            <label className="govuk-label govuk-date-input__label" htmlFor={inputId}>Day</label>
                            <input className="govuk-input govuk-date-input__input govuk-input--width-6"
                                   id={inputId} name={inputId}
                                   type="date"
                                   value={date}
                                   onChange={(e) => setDateTime(e.target.value)}
                                   onBlur={checkDate}
                            />
                        </div>
                    </div>
                </div>
            </fieldset>
        </div>
    )
}