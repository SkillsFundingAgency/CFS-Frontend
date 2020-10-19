import React from 'react';

export function formatDate(date?: Date, utc?: boolean) {
    if (!date) return "";

    const actualDate: Date = new Date(date);
    const day: number = actualDate.getDate();
    const month: string = actualDate.toLocaleString('default', {month: 'long'});
    const year: number = actualDate.getFullYear();

    if (utc === null || utc === undefined) {
        return `${day} ${month} ${year}`;
    }

    const hours: number = actualDate.getHours();
    const minutes: number = actualDate.getMinutes();

    if (utc) {
        const utcTime: string = actualDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});
        return `${day} ${month} ${year} ${utcTime}`;
    } else {
        return `${day} ${month} ${year} ${hours}:${minutes < 10 ? "0" + minutes : minutes} ${hours < 12 ? "am" : "pm"}`;

    }
}

export function DateFormatter(props: {date?: Date, utc?: boolean}) {
    return (
        <span>{formatDate(props.date, props.utc)}</span>
    );
}