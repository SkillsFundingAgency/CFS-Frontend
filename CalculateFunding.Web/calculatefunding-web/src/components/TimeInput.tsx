import React, { useEffect, useState } from "react";

export interface TimeInputProps {
  time: string;
  callback: any;
  inputName?: string;
}

export function TimeInput(props: TimeInputProps) {
  const [localTime, setTime] = useState(props.time);
  const propTime = props.time;
  const inputId = props.inputName == null ? generateRandomId() : props.inputName;
  const [timeError, setTimeError] = useState<boolean>(false);

  useEffect(() => {
    setTime(propTime);
    props.callback(propTime);
  }, [propTime]);

  function generateRandomId() {
    return Math.random().toString(36).substr(2);
  }

  function changeTime(e: React.ChangeEvent<HTMLInputElement>) {
    if ("0" || "00" || parseInt(e.target.value)) {
      const newTime = parseInt(e.target.value === "" ? "0" : e.target.value);

      if (newTime >= 0 && newTime < 13) {
        setTime(e.target.value);
        props.callback(e.target.value);
        setTimeError(false);
      }
    } else {
      setTimeError(true);
      setTime(e.target.value);
      props.callback("");
    }
  }

  return (
    <div className={"govuk-form-group" + (timeError ? " govuk-form-group--error" : "")}>
      <fieldset
        className={"govuk-fieldset govuk-!-margin-top-5"}
        role="group"
        aria-describedby={`timeInputFieldset-${inputId}`}
      >
        <label className="govuk-label govuk-date-input__label" htmlFor={`timeInput-${inputId}`}>
          Time
        </label>
        <span id="statementRelease-time" className="govuk-hint">
          For example, 10:00AM
        </span>
        <div className="govuk-date-input" id={`timeInput-${inputId}`}>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor={`${inputId}`}>
                Hour
              </label>
              <input
                className="govuk-input govuk-date-input__input govuk-input--width-2"
                type="text"
                maxLength={2}
                value={localTime}
                id={inputId}
                name={inputId}
                onBlur={(e) => changeTime(e)}
                onChange={(e) => changeTime(e)}
              />
            </div>
          </div>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label
                className="govuk-label govuk-date-input__label govuk-!-margin-bottom-2"
                htmlFor="passport-issued-month"
              >
                Minute
              </label>
              <label className="govuk-label govuk-date-input__label" htmlFor="passport-issued-month">
                :00
              </label>
            </div>
          </div>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor="passport-issued-year">
                AM/PM
              </label>
              <select className="govuk-select" id="sort" name="sort">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
