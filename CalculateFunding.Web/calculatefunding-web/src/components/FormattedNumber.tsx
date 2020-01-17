import * as React from "react";

export enum NumberType {
    FormattedDecimalNumber,
    FormattedMoney
}

export function FormattedNumber(props: { value: number, type:NumberType, decimalPoint?: number }) {
    let decimalPoint = 2;
    if (props.decimalPoint != null)
        decimalPoint = props.decimalPoint;

    let decimalPointedNumber = parseFloat(String(Math.round(props.value * 100) / 100)).toFixed(decimalPoint);

    let formattedNumber = decimalPointedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (props.type === NumberType.FormattedMoney)
    {
        formattedNumber = "£" + formattedNumber;
    }
    return (<span>{formattedNumber}</span>)
}