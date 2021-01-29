import React from 'react';
import {DateTime} from "luxon";

export function formatDate(date?: Date) {
    if (!date) return "";
    const luxonDate : DateTime = DateTime.fromJSDate(new Date(date)).toUTC();

    return luxonDate.toFormat("d MMMM yyyy");
}

export function DateFormatter(props: {date?: Date}) {
    return (
        <span data-testid="date-formatter">{formatDate(props.date)}</span>
    );
}