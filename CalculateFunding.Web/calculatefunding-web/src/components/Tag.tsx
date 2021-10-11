import React from "react";
import styled from "styled-components";

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
  text: string;
  type: TagTypes;
}

export function Tag({ text, type }: TagProps): JSX.Element {
  return <TagContainer className={type}>{text}</TagContainer>;
}

const TagContainer = styled.strong`
  vertical-align: bottom;
  margin: 0 12px 5px 0;
`;
