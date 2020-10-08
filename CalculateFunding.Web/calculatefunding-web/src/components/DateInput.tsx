import React, {useState} from 'react';
import {DateTime} from "luxon";

export function DateInput(props: { date: Date, callback: any, inputName?: string }) {
    const inputId = props.inputName == null ? generateRandomId() : props.inputName;
    const inputDayId = inputId;
    const [date, setDate] = useState<Date>(props.date);

    const [dateIsValid, setDateIsValid] = useState<boolean>(true);

    function generateRandomId() {
        return Math.random().toString(36).substr(2);
    }

    function setDateTime(day: string) {
        let newDate = DateTime.fromISO(day)
        setDate(newDate.toJSDate());
        const updatedDate: Date = newDate.toJSDate();
        if (updatedDate !== undefined && !isNaN(updatedDate.getDate())) {
            props.callback(updatedDate);
            setDateIsValid(true);
        } else {
            setDateIsValid(false);
        }
    }

    function checkDate() {
        const currentDate = DateTime.fromJSDate(date);

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
                            <label className="govuk-label govuk-date-input__label" htmlFor={inputDayId}>Day</label>
                            <input className="govuk-input govuk-date-input__input govuk-input--width-6"
                                   id={inputDayId} name={inputDayId}
                                   type="date"
                                   defaultValue={`${props.date}`}
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