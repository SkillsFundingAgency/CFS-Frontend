import React from "react";

export function BackAnchor(props: { name: string; callback: any }) {
  const callback = props.callback;
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a href="#" className="govuk-back-link" onClick={callback}>
      {props.name}
    </a>
  );
}
