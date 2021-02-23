
import {DateTime} from "luxon";

export function formatDateTime(date?: Date) {
    if (!date) return "";
    const luxonDate : DateTime = DateTime.fromJSDate(new Date(date)).toUTC();

    return luxonDate.toUTC().toFormat("d MMMM yyyy HH:mm");
}

export function formatDate(date?: Date) {
    if (!date) return "";
    const luxonDate : DateTime = DateTime.fromJSDate(new Date(date)).toUTC();

    return luxonDate.toFormat("d MMMM yyyy");
}