import React from 'react';

export function DateFormatter(props: { date: Date, utc: boolean }) {
    const date: Date = new Date(props.date);
    const day: number = date.getDate();
    const month: string = date.toLocaleString('default', {month: 'long'});
    const year: number = date.getFullYear();
    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();
    const utcTime: string = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});

    if (props.utc) {
        return (
            <span>{day} {month} {year} {utcTime}</span>)
    } else {
        return (
            <span>{day} {month} {year} {hours}:{minutes < 10 ? "0" + minutes : minutes} {hours < 12 ? "am" : "pm"}</span>
        )
    }
}