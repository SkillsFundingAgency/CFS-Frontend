import React from "react";

export interface FieldsetProps {
  token: string;
  heading: string;
  titleCaption?: string;
  children?: any;
}

export const PageHeaderFieldset: React.FunctionComponent<FieldsetProps> = ({
  token,
  heading,
  titleCaption,
  children,
}) => {
  return (
    <fieldset className="govuk-fieldset" aria-describedby={`${token}-hint`}>
      {!!heading?.length && (
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
          {!!titleCaption?.length && (
            <h3 className="govuk-caption-xl">{titleCaption}</h3>
          )}
          <h1 className="govuk-fieldset__heading">{heading}</h1>
        </legend>
      )}
      {children}
    </fieldset>
  );
};

export const InlineFieldset: React.FunctionComponent<FieldsetProps> = ({
  token,
  heading,
  titleCaption,
  children,
}) => {
  return (
    <fieldset className="govuk-fieldset" aria-describedby={`${token}-hint`}>
      {!!heading?.length && (
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
          <h4 className="govuk-fieldset__heading govuk-caption-s">{heading}</h4>
        </legend>
      )}
      {!!titleCaption?.length && (
        <span className="govuk-hint">{titleCaption}</span>
      )}
      {children}
    </fieldset>
  );
};
