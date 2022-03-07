import "../../src/App.scss";

import React from "react";

export interface WarningTextProps {
  text: string;
  hidden?: boolean;
  className?: string;
}

export const WarningText: React.FunctionComponent<WarningTextProps> = ({
  text,
  className,
  hidden = false,
}: WarningTextProps) => {
  return (
    <div
      role="alert"
      aria-labelledby="warning-text"
      className={`govuk-warning-text ${className || ""}`}
      hidden={hidden}
    >
      <span className="govuk-warning-text__icon" aria-hidden="true">
        !
      </span>
      <strong className="govuk-warning-text__text">
        <span className="govuk-warning-text__assistive">Warning</span>
        <span id="warning-text">{text}</span>
      </strong>
    </div>
  );
};
