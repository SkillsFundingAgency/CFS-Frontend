import { Decimal } from "decimal.js";
import React from "react";

export enum NumberType {
  FormattedDecimalNumber,
  FormattedMoney,
  FormattedPercentage,
  WeightedNumber,
  FormattedValue
}

export function toDecimal(amount: number, places: number) {
  return +amount.toFixed(places);
}

export function isNullOrUndefined(value: any) {
  return value === undefined || value === null;
}

export function isNumeric(value: any): value is number {
  return !isNullOrUndefined(value) && !isNaN(value) && !isNaN(parseFloat(value));
}

export function isBoolean(value: any): value is boolean {
  return !isNullOrUndefined(value) && (value.toString() === "true" || value.toString() === "false");
}

export function formatNumber(value: number, type: NumberType, decimalPlaces: number, includeSymbol: boolean) {
  if (!isNumeric(value)) return `${value}`;
  const decimalPointedNumber = new Decimal(value).toFixed(decimalPlaces);

  const formattedNumber = decimalPointedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (type === NumberType.FormattedMoney) {
    let formattedCurrency = decimalPointedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    formattedCurrency = "£" + formattedCurrency;
    return formattedCurrency;
  }

  if (type === NumberType.FormattedPercentage) {
    let formattedPercentage = decimalPointedNumber.toString();
    formattedPercentage = formattedPercentage + (isBoolean(includeSymbol) && includeSymbol ? "%" : "");
    return formattedPercentage;
  }
  
  if (type === NumberType.WeightedNumber) {
    return parseFloat(decimalPointedNumber).toString();
  }

  if (type === NumberType.FormattedValue) {
    return parseFloat(decimalPointedNumber).toString();
  }
  
  return formattedNumber;
}

export function FormattedNumber(props: {
  value?: number;
  type: NumberType;
  decimalPlaces?: number | null;
  includeSymbol?: boolean | undefined;
}) {
  if (!isNumeric(props.value)) return <span></span>;

  const decimalPoint = isNumeric(props.decimalPlaces) ? props.decimalPlaces : 2;

  const includeSymbol = isBoolean(props.includeSymbol) ? props.includeSymbol : true;

  const formattedNumber = formatNumber(props.value, props.type, decimalPoint, includeSymbol);

  return <span>{formattedNumber}</span>;
}
