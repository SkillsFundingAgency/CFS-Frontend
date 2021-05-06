
import {DateTime} from "luxon";

export function formatDateTime(date?: Date, militaryTime?:boolean) {
    if (!date) return "";
    const luxonDate : DateTime = DateTime.fromJSDate(new Date(date));

    return militaryTime ? luxonDate.setZone("Europe/London").toFormat("d MMMM yyyy HH:mm") : luxonDate.setZone("Europe/London").toFormat("d MMMM yyyy h:mm a");
}

export function formatDate(date?: Date) {
    if (!date) return "";
    const luxonDate : DateTime = DateTime.fromJSDate(new Date(date));

    return luxonDate.setZone("Europe/London").toFormat("d MMMM yyyy");
}
