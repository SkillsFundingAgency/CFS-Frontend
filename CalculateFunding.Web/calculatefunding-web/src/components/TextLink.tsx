import React from "react";
import { Link } from "react-router-dom";

export const TextLink = ({ to, children, css, describedBy }: { to: string; children: string; css?: string; describedBy?: string }) => {
  if (!to?.length || !children?.length) return null;

  return (
    <Link className={`govuk-link govuk-link--no-visited-state ${css ?? ""}`} to={to} aria-label={children as string} aria-describedby={describedBy}>
      {children}
    </Link>
  );
};
