import React from 'react';
import {DateTime} from "luxon";
import {formatDate} from "../helpers/DateHelper";


export function DateFormatter(props: {date?: Date}) {
    return (
        <span data-testid="date-formatter">{formatDate(props.date)}</span>
    );
}