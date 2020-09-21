import React from "react";

export enum NumberType {
    FormattedDecimalNumber,
    FormattedMoney,
    FormattedPercentage
}

export function FormattedNumber(props: {value?: number, type: NumberType, decimalPlaces?: number}) {
    if (props.value === undefined || props.value === null) return <span></span>;

    let decimalPoint = props.decimalPlaces != null && props.decimalPlaces !== undefined ? props.decimalPlaces : 2;

    let decimalPointedNumber = parseFloat(String(Math.round(props.value * 100) / 100)).toFixed(decimalPoint);

    let formattedNumber = decimalPointedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (props.type === NumberType.FormattedMoney) {
        formattedNumber = "£" + formattedNumber;
    }

    if(props.type === NumberType.FormattedPercentage) {
        formattedNumber = formattedNumber + "%";
    }

    return (<span>{formattedNumber}</span>)
}