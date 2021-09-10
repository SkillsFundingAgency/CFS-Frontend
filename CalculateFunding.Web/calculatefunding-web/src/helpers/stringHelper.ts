export function convertToSlug(text: string) {
  return !text
    ? ""
    : text
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
}

export function convertCamelCaseToSpaceDelimited(text: string) {
  return !text ? "" : text.replace(/([A-Z])/g, " $1").trim();
}

export function removeSpaces(text: string) {
  return !text ? "" : text.replace(/\s+/g, "");
}
