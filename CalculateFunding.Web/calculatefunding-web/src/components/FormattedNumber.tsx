import React from "react";

export enum NumberType {
    FormattedDecimalNumber,
    FormattedMoney,
    FormattedPercentage
}

export function toDecimal(amount: number, places: number) {
    return +(amount).toFixed(places);
}

export function formatNumber(value: number, type: NumberType, decimalPlaces: number) {
    const decimalPointedNumber = parseFloat(String(Math.round(value * 100) / 100)).toFixed(decimalPlaces);

    let formattedNumber = decimalPointedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (type === NumberType.FormattedMoney) {
        formattedNumber = "£" + formattedNumber;
    }

    if(type === NumberType.FormattedPercentage) {
        formattedNumber = formattedNumber + "%";
    }

    return formattedNumber
}

export function FormattedNumber(props: {value?: number, type: NumberType, decimalPlaces?: number | null}) {
    if (props.value === undefined || props.value === null) return <span></span>;

    const decimalPoint = props.decimalPlaces != null && props.decimalPlaces !== undefined ? props.decimalPlaces : 2;

    const formattedNumber = formatNumber(props.value, props.type, decimalPoint);

    return (<span>{formattedNumber}</span>)
}