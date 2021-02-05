import React from 'react';
import {DateTime} from "luxon";

export function DateTimeFormatter(props: {date: Date}) {

    function formatDateTime(date?: Date) {
        if (!date) return "";
        const luxonDate : DateTime = DateTime.fromJSDate(new Date(date)).toUTC();

        return luxonDate.toUTC().toFormat("d MMMM yyyy HH:mm");
    }

    return (
        <span data-testid="datetime-formatter">{formatDateTime(props.date)}</span>
    );
}