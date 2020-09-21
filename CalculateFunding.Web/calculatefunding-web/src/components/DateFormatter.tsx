import React from 'react';

export function DateFormatter(props: {date?: Date, utc?: boolean}) {
    if (!props.date) return <span></span>;

    const date: Date = new Date(props.date);
    const day: number = date.getDate();
    const month: string = date.toLocaleString('default', {month: 'long'});
    const year: number = date.getFullYear();

    if (props.utc === null || props.utc === undefined) {
        return <span>{day} {month} {year}</span>
    }

    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();

    if (props.utc) {
        const utcTime: string = date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});
        return (
            <span>{day} {month} {year} {utcTime}</span>)
    } else {
        return (
            <span>{day} {month} {year} {hours}:{minutes < 10 ? "0" + minutes : minutes} {hours < 12 ? "am" : "pm"}</span>
        )
    }
}