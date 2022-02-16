import React from "react";
import { Link } from "react-router-dom";
import { renderToString } from "react-dom/server";

export const TextLink = ({
  to,
  children,
  additionalCss,
  label,
  describedBy,
  handleOnClick,
}: {
  to?: string;
  children: any;
  additionalCss?: string;
  label?: string;
  describedBy?: string;
  handleOnClick?: (event: any) => void;
}): JSX.Element => {
  if (!handleOnClick && !to?.length) return <></>;

  const onClickHandler = (event: any) => {
    if (!handleOnClick) return;

    event.preventDefault();

    handleOnClick(event);
  };

  return (
    <Link
      className={`govuk-link govuk-link--no-visited-state ${additionalCss ?? ""}`}
      to={to ?? ""}
      aria-label={label ?? renderToString(children)}
      aria-describedby={describedBy}
      onClick={onClickHandler}
    >
      {children}
    </Link>
  );
};
