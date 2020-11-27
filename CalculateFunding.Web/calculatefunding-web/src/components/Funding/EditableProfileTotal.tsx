import "../../styles/EditableProfileTotal.scss";
import React, {useState, useEffect, ChangeEvent} from "react";
import {formatNumber, FormattedNumber, NumberType} from "../FormattedNumber";
import {ProfileTotal} from "../../types/PublishedProvider/FundingLineProfile";
import {clone} from "lodash";
import {ErrorMessage} from "../../types/ErrorMessage";

interface EditableProfileTotalProps {
    index: number,
    isEditMode: boolean,
    remainingAmount: number,
    profileTotal: ProfileTotal,
    setProfileTotal: (instalmentNumber: number, profileTotal: ProfileTotal) => void,
    errors: ErrorMessage[],
    addErrorMessage: (errorMessage: string, fieldName?: string) => void,
    clearErrorMessages: (fieldNames?: string[]) => void,
}

export function EditableProfileTotal({
    index,
    isEditMode,
    remainingAmount,
    profileTotal,
    setProfileTotal,
    errors,
    addErrorMessage,
    clearErrorMessages,
}: EditableProfileTotalProps) {
    const [value, setValue] = useState<string>("");
    const [percent, setPercent] = useState<string>("");

    useEffect(() => {
        const formattedNumber = formatNumber(profileTotal.value, NumberType.FormattedDecimalNumber, 2);
        setValue(formattedNumber);
        const formattedPercent = formatNumber(profileTotal.profileRemainingPercentage ?
            profileTotal.profileRemainingPercentage : 0, NumberType.FormattedDecimalNumber, 2);
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
        setPercent(rawValue);
    }

    const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setValue(rawValue);
    }

    function setValueAndPercent(value: number, percent: number) {
        const updatedProfileTotal = clone(profileTotal);
        updatedProfileTotal.value = value;
        updatedProfileTotal.profileRemainingPercentage = percent;
        setProfileTotal(installmentNumber, updatedProfileTotal);
    }

    const handlePercentBlur = () => {
        clearErrorMessages([`value-${installmentNumber}`, `percent-${installmentNumber}`]);
        if (!percent || percent.length === 0) {
            setValueAndPercent(0, 0);
        } else {
            const newPercent = getCurrentPercentAsNumber();
            const newValue = (newPercent / 100) * remainingAmount;
            setValueAndPercent(newValue, newPercent);
            validatePercent(newPercent)
            validateValue(newValue);
        }
    }

    const validatePercent = (newPercent: number) => {
        if (newPercent > 100) {
            addErrorMessage("Cannot be greater than 100%", `percent-${installmentNumber}`);
        }
    }

    const validateValue = (newValue: number) => {
        if (newValue > remainingAmount) {
            addErrorMessage("Cannot be greater than balance available", `value-${installmentNumber}`);
        }
    }

    const handleValueBlur = () => {
        clearErrorMessages([`value-${installmentNumber}`, `percent-${installmentNumber}`]);
        if (!value || value.length === 0) {
            setValueAndPercent(0, 0);
        } else {
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
                {!isEditMode || isPaid ? <FormattedNumber value={profileTotal.profileRemainingPercentage} type={NumberType.FormattedPercentage} /> :
                    <div className={`govuk-form-group editable-field ${errors.filter(
                        e => e.fieldName === `percent-${installmentNumber}`).length > 0 ? 'govuk-form-group--error' : ''}`}>
                        {errors.filter(e => e.fieldName === `percent-${installmentNumber}`).length > 0 ?
                            errors.map(error => error.fieldName === `percent-${installmentNumber}` &&
                                <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                    <span className="govuk-visually-hidden">Error:</span> {error.message}
                                </span>
                            ) : null}
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
                            autoComplete="off" />
                        <span className="suffix" aria-label="Enter amount in percent">%</span>
                    </div>}
            </td>
            <td className="govuk-table__cell govuk-table__cell--numeric" data-testid={`remaining-value-${index}`}>
                {!isEditMode || isPaid ? <FormattedNumber value={profileTotal.value} type={NumberType.FormattedMoney} /> :
                    <div className={`govuk-form-group editable-field ${errors.filter(
                        e => e.fieldName === `value-${installmentNumber}`).length > 0 ? 'govuk-form-group--error' : ''}`}>
                        {errors.filter(e => e.fieldName === `value-${installmentNumber}`).length > 0 ?
                            errors.map(error => error.fieldName === `value-${installmentNumber}` &&
                                <span key={error.id} className="govuk-error-message govuk-!-margin-bottom-1">
                                    <span className="govuk-visually-hidden">Error:</span> {error.message}
                                </span>
                            ) : null}
                        <span className="prefix" aria-label="Enter amount in pounds and pence">£</span>
                        <input id={`value-${installmentNumber}`}
                            data-testid={`value-${installmentNumber}`}
                            name={`value-${installmentNumber}`}
                            type="text"
                            value={value}
                            onChange={handleValueChange}
                            onBlur={handleValueBlur}
                            aria-label="Enter the total value. Enter 0 if this does not apply"
                            aria-describedby="value"
                            className="govuk-input govuk-input--width-10 input-prefix"
                            autoComplete="off" />
                    </div>}
            </td>
        </>
    )
}