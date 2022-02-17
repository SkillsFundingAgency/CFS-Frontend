import React from "react";
import { useHistory } from "react-router";

import { TextLink } from "./TextLink";

export interface BackLinkProps {
  to?: string | undefined;
  children?: any;
  className?: string;
  handleOnClick?: any;
}

export const BackLink = ({ to = "", children = "Back", handleOnClick, className }: BackLinkProps) => {
  const history = useHistory();

  const onClickHandler = (event: any) => {
    event.preventDefault();
    if (handleOnClick) {
      handleOnClick();
    } else {
      if (!to || to?.length === 0) {
        history.goBack();
      } else {
        history.push(to);
      }
    }
    return;
  };

  return (
    <TextLink
      to={to}
      handleOnClick={handleOnClick ?? onClickHandler}
      additionalCss={`govuk-back-link ${className}`}
    >
      {children}
    </TextLink>
  );
};
