import React from "react";

export enum TagTypes {
    default = "govuk-tag",
    grey = "govuk-tag govuk-tag--grey",
    red = "govuk-tag govuk-tag--red",
    blue = "govuk-tag govuk-tag--blue",
    green = "govuk-tag govuk-tag--green",
    yellow = "govuk-tag govuk-tag--yellow",
    purple = "govuk-tag govuk-tag--purple",
    pink = "govuk-tag govuk-tag--pink",
    orange = "govuk-tag govuk-tag--orange",
    turquoise = "govuk-tag govuk-tag--turquoise",
}

export interface TagProps {
    text: string,
    type: TagTypes,
}

export function Tag({text, type}: TagProps) {
    return <strong className={type}>
        {text}
    </strong>;
}
