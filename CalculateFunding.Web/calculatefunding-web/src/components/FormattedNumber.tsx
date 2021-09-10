import { Decimal } from "decimal.js";
import React from "react";

export enum NumberType {
  FormattedDecimalNumber,
  FormattedMoney,
  FormattedPercentage,
}

export function toDecimal(amount: number, places: number) {
  return +amount.toFixed(places);
}

export function formatNumber(value: number, type: NumberType, decimalPlaces: number, includeSymbol: boolean) {
  const decimalPointedNumber = new Decimal(value).toFixed(decimalPlaces);

  const formattedNumber = decimalPointedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (type === NumberType.FormattedMoney) {
    let formattedCurrency = decimalPointedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    formattedCurrency = "£" + formattedCurrency;
    return formattedCurrency;
  }

  if (type === NumberType.FormattedPercentage) {
    let formattedPercentage = decimalPointedNumber.toString();
    formattedPercentage = formattedPercentage + (includeSymbol ? "%" : "");
    return formattedPercentage;
  }

  return formattedNumber;
}

export function FormattedNumber(props: {
  value?: number;
  type: NumberType;
  decimalPlaces?: number | null;
  includeSymbol?: boolean | undefined;
}) {
  if (props.value === undefined || props.value === null) return <span></span>;

  const decimalPoint =
    props.decimalPlaces != null && props.decimalPlaces !== undefined ? props.decimalPlaces : 2;

  const includeSymbol =
    props.includeSymbol != null && props.includeSymbol !== undefined ? props.includeSymbol : true;

  const formattedNumber = formatNumber(props.value, props.type, decimalPoint, includeSymbol);

  return <span>{formattedNumber}</span>;
}
