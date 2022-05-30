import React from "react";

import { formatDateTime, formatDateTimeWithSuppliedFormatter } from "../helpers/DateHelper";

export interface DateTimeFormatterProps {
  date: Date;
  militaryTime?: boolean
}

export interface DateTimeFormatSuppliedProps {
  date: Date;
  format: string
}

const isFormatterSupplied = (arg: any): arg is DateTimeFormatSuppliedProps => {
  return !!arg?.format?.length;
}

export const DateTimeFormatter = (props: DateTimeFormatterProps | DateTimeFormatSuppliedProps) => {
  return <span
    data-testid="datetime-formatter">
    {isFormatterSupplied(props) ? formatDateTimeWithSuppliedFormatter(props.format, props.date) : formatDateTime(props.date, props.militaryTime)}
  </span>;
}

