import React from 'react';
import {DateTime} from "luxon";
import {formatDateTime} from "../helpers/DateHelper";

export function DateTimeFormatter(props: {date: Date, militaryTime?:boolean}) {
    return (
        <span data-testid="datetime-formatter">{formatDateTime(props.date, props.militaryTime)}</span>
    );
}
