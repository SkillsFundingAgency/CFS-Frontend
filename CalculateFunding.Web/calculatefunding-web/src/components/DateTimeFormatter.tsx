import React from 'react';
import {DateTime} from "luxon";
import {formatDateTime} from "../helpers/DateHelper";

export function DateTimeFormatter(props: {date: Date}) {
    return (
        <span data-testid="datetime-formatter">{formatDateTime(props.date)}</span>
    );
}