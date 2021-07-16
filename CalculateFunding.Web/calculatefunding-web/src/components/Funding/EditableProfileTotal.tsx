import "../../styles/EditableProfileTotal.scss";
import React, {useState, useEffect, ChangeEvent} from "react";
import {formatNumber, FormattedNumber, NumberType, toDecimal} from "../FormattedNumber";
import {ProfileTotal} from "../../types/PublishedProvider/FundingLineProfile";
import {clone} from "lodash";
import {ErrorMessage} from "../../types/ErrorMessage";
import {ErrorProps} from "../../hooks/useErrors";

interface EditableProfileTotalProps {
    index: number,
    isEditMode: boolean,
    remainingAmount: number,
    profileTotal: ProfileTotal,
    setProfileTotal: (instalmentNumber: number, profileTotal: ProfileTotal) => void,
    setIsDirty: (isDirty: boolean) => void,
    errors: ErrorMessage[],
    addError: (props: ErrorProps) => void,
    clearErrorMessages: (fieldNames?: string[]) => void,
}

export function EditableProfileTotal(
    {
        index,
        isEditMode,
        remainingAmount,
        profileTotal,
        setProfileTotal,
        setIsDirty,
        errors,
        addError,
        clearErrorMessages,
    }: EditableProfileTotalProps) {
    const [value, setValue] = useState<string>("");
    const [percent, setPercent] = useState<string>("");

    useEffect(() => {
        const formattedNumber = formatNumber(profileTotal.value, NumberType.FormattedDecimalNumber, 2, true);
        setValue(formattedNumber);
        const formattedPercent = formatNumber(profileTotal.profileRemainingPercentage ?
            profileTotal.profileRemainingPercentage : 0, NumberType.FormattedPercentage, 7, false);
        setPercent(formattedPercent);
    }, [profileTotal]);

    const {installmentNumber, isPaid} = profileTotal;

    const getCurrentValueAsNumber = (): number => {
        return parseFloat(value.replace(/,/g, ''));
    }

    const getCurrentPercentAsNumber = (): number => {
        return parseFloat(percent.replace(/,/g, ''));
    }

    const handlePercentChange = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setIsDirty(true);
        setPercent(rawValue);
    }

    const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setIsDirty(true);
        setValue(rawValue);
    }

    function setValueAndPercent(value: number, percent: number) {
        const updatedProfileTotal = clone(profileTotal);
        updatedProfileTotal.value = toDecimal(value, 2);
        updatedProfileTotal.profileRemainingPercentage = toDecimal(percent, 7);
        setIsDirty(true);
        setProfileTotal(installmentNumber, updatedProfileTotal);
    }

    const handlePercentBlur = () => {
        clearErrorMessages([`value-${installmentNumber}`, `percent-${installmentNumber}`]);
        if (!percent || percent.length === 0) {
            setValueAndPercent(0, 0);
        } else {
            setIsDirty(true);
            const newPercent = getCurrentPercentAsNumber();
            const newValue = (newPercent / 100) * remainingAmount;
            setValueAndPercent(newValue, newPercent);
            validatePercent(newPercent)
            validateValue(newValue);
        }
    }

    const validatePercent = (newPercent: number) => {
        if (newPercent > 100) {
            addError({error: "Cannot be greater than 100%", fieldName: `percent-${installmentNumber}`});
        }
    }

    const validateValue = (newValue: number) => {
        if (newValue > remainingAmount) {
            addError({error: "Cannot be greater than balance available", fieldName: `value-${installmentNumber}`});
        }
    }

    const handleValueBlur = () => {
        clearErrorMessages([`value-${installmentNumber}`, `percent-${installmentNumber}`]);
        if (!value || value.length === 0) {
            setValueAndPercent(0, 0);
        } else {
            setIsDirty(true);
            const newValue = getCurrentValueAsNumber();
            const newPercent = (newValue / remainingAmount) * 100;
            setValueAndPercent(newValue, newPercent);
            validateValue(newValue);
            validatePercent(newPercent);
        }
    }

    return (
        <>
            <td className="govuk-table__cell" data-testid={`remaining-percentage-${index}`}>
                {!isEditMode || isPaid ? <FormattedNumber value={profileTotal.profileRemainingPercentage} type={NumberType.FormattedPercentage}  /> :
                    <div className={`govuk-form-group editable-field ${errors.filter(
                        e => e.fieldName === `percent-${installmentNumber}`).length > 0 ? 'govuk-form-group--error' : ''}`}>
                        {errors.filter(e => e.fieldName === `percent-${installmentNumber}`).length > 0 ?
                            errors.map(error => error.fieldName === `percent-${installmentNumber}` &&
                                <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                    <span className="govuk-visually-hidden">Error:</span> {error.message}
                                </span>
                            ) : null}
                        <div className="govuk-input__wrapper">
                            <input id={`percent-${installmentNumber}`}
                                   data-testid={`percent-${installmentNumber}`}
                                   name={`percent-${installmentNumber}`}
                                   type="text"
                                   value={percent}
                                   onChange={handlePercentChange}
                                   onBlur={handlePercentBlur}
                                   aria-label="Enter the total percentage. Enter 0 if this does not apply"
                                   aria-describedby="percent"
                                   className="govuk-input govuk-input--width-10"
                                   autoComplete="off"/>
                            <div className="govuk-input__suffix" aria-hidden="true" aria-label="Enter amount in percent">%</div>
                        </div>
                    </div>}
            </td>
            <td className="govuk-table__cell" data-testid={`remaining-value-${index}`}>
                {!isEditMode || isPaid ? <FormattedNumber value={profileTotal.value} type={NumberType.FormattedMoney}/> :
                    <div className={`govuk-form-group editable-field ${errors.filter(
                        e => e.fieldName === `value-${installmentNumber}`).length > 0 ? 'govuk-form-group--error' : ''}`}>
                        {errors.filter(e => e.fieldName === `value-${installmentNumber}`).length > 0 ?
                            errors.map(error => error.fieldName === `value-${installmentNumber}` &&
                                <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                    <span className="govuk-visually-hidden">Error:</span> {error.message}
                                </span>
                            ) : null}
                        <div className="govuk-input__wrapper">
                            <div className="govuk-input__prefix right-align"
                                 aria-label="Enter amount in pounds and pence"
                                 aria-hidden="true">£
                            </div>
                            <input id={`value-${installmentNumber}`}
                                   data-testid={`value-${installmentNumber}`}
                                   name={`value-${installmentNumber}`}
                                   type="text"
                                   value={value}
                                   onChange={handleValueChange}
                                   onBlur={handleValueBlur}
                                   aria-label="Enter the total value. Enter 0 if this does not apply"
                                   aria-describedby="value"
                                   className="govuk-input input-prefix govuk-input--width-10 govuk-!-padding-left-1"
                                   autoComplete="off"/>
                        </div>
                    </div>}
            </td>
        </>
    )
}
