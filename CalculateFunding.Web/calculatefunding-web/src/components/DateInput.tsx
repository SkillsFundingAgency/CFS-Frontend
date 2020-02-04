import React, {useEffect, useState} from 'react';

export function DateInput(props: { day: number, month: number, year: number, callback: any, inputName?: string }) {
    const propDay = props.day;
    const propMonth = props.month;
    const propYear = props.year;
    const inputId = props.inputName == null? generateRandomId() : props.inputName;
    const inputDayId = inputId + "_day";
    const inputMonthId = inputId + "_month";
    const inputYearId = inputId + "_year";

    const [localDay, setDay] = useState(props.day);
    const [localMonth, setMonth] = useState(props.month);
    const [localYear, setYear] = useState(props.year);

    useEffect(() => {
        setDay(propDay);
        setMonth(propMonth + 1); // adapt to calendar month from javascript's zero index month
        setYear(propYear);
        const displayDate: Date = new Date(propYear,propMonth,propDay);
        props.callback(displayDate);
    }, [propDay, propMonth, propYear]);

    function generateRandomId ()
    {
        return Math.random().toString(36).substr(2);
    }

    if (localDay === null)
        setDay(1);

    function setDateTime(day: number, month: number, year: number) {
        setDay(day);
        setMonth(month);
        setYear(year);
        const updatedDate: Date = new Date(`${year}-${month}-${day}`);
        if (updatedDate !== undefined && !isNaN(updatedDate.getDate())) {
            props.callback(updatedDate);
        }
    }

    return (
        <div className="govuk-date-input" id="passport-issued">
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label className="govuk-label govuk-date-input__label" htmlFor={inputDayId}>Day</label>
                    <input className="govuk-input govuk-date-input__input govuk-input--width-2"
                           id={inputDayId} name={inputDayId}
                           type="number" pattern="[0-9]*" max={31} min={1}
                           value={localDay.toString()}
                           onChange={(e) => setDateTime(parseInt(e.target.value), localMonth, localYear)}
                    />
                </div>
            </div>
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label className="govuk-label govuk-date-input__label" htmlFor={inputMonthId}>Month</label>
                    <input className="govuk-input govuk-date-input__input govuk-input--width-2"
                           id={inputMonthId} name={inputMonthId}
                           type="number" pattern="[0-9]*"
                           value={localMonth.toString()}
                           onChange={(e) => setDateTime(localDay, parseInt(e.target.value), localYear)}
                    />
                </div>
            </div>
            <div className="govuk-date-input__item">
                <div className="govuk-form-group">
                    <label className="govuk-label govuk-date-input__label"
                           htmlFor={inputYearId}>Year</label>
                    <input
                        className="govuk-input govuk-date-input__input govuk-input--width-4"
                        id={inputYearId} name={inputYearId}
                        type="number" pattern="[0-9]*"
                        value={localYear.toString()}
                        onChange={(e) => setDateTime(localDay, localMonth, parseInt(e.target.value))}
                    />
                </div>
            </div>
        </div>
    )
}