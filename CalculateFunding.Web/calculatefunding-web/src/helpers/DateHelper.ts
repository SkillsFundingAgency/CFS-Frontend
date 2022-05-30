import { DateTime } from "luxon";

export function formatDateTime(date?: Date, militaryTime?: boolean) {
  if (!date) return "";
  const luxonDate: DateTime = DateTime.fromJSDate(new Date(date));

  return militaryTime
    ? luxonDate.setZone("Europe/London").toFormat("d MMMM yyyy HH:mm")
    : luxonDate.setZone("Europe/London").toFormat("d MMMM yyyy h:mm a");
}
//11 Nov 2019 10:54am
//d MM yyy h:mma
export function formatDateTimeWithSuppliedFormatter(format: string, date?: Date) {
  if (!date) return "";
  const luxonDate: DateTime = DateTime.fromJSDate(new Date(date));

  return luxonDate.setZone("Europe/London").toFormat(format);
}

export function formatDate(date?: Date) {
  if (!date) return "";
  const luxonDate: DateTime = DateTime.fromJSDate(new Date(date));

  return luxonDate.setZone("Europe/London").toFormat("d MMMM yyyy");
}
