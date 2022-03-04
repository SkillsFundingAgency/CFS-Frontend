import React from "react";
import { renderToString } from "react-dom/server";
import { Link } from "react-router-dom";

export const TextLink = ({
  id,
  to,
  children,
  additionalCss,
  label,
  describedBy,
  handleOnClick,
}: {
  id?: string;
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
      id={id ?? ""}
      to={to ?? ""}
      aria-label={label ?? renderToString(children)}
      aria-describedby={describedBy}
      onClick={onClickHandler}
    >
      {children}
    </Link>
  );
};
