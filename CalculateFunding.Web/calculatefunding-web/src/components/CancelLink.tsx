import React from "react";
import { useHistory } from "react-router";

import { TextLink } from "./TextLink";

export interface CancelLinkProps {
  to?: string | undefined;
  children?: any;
  className?: string;
  handleOnClick?: any;
}

export const CancelLink = ({ to = "", children = "Cancel", handleOnClick, className }: CancelLinkProps) => {
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
      additionalCss={className}
    >
      {children}
    </TextLink>
  );
};
