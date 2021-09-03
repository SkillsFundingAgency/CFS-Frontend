import React from "react";
import { InlineFieldset, PageHeaderFieldset } from "./Fieldset";

export interface FormProps {
  token: string;
  heading: string;
  inline?: boolean; // whether the form is inside a page with existing page title etc or not
  titleCaption?: string;
  onSubmit?: any;
  children: any;
}

const Form: React.FunctionComponent<FormProps> = ({
  token,
  inline,
  heading,
  titleCaption,
  onSubmit,
  children,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    onSubmit ? onSubmit() : e.preventDefault();
  };
  return (
    <form
      id={`form-${token}`}
      data-testid={`form-${token}`}
      className={`form ${inline ? "govuk-!-margin-top-3" : ""}`}
      onSubmit={handleSubmit}
      noValidate={true}
    >
      <div className="govuk-form-group">
        {inline ? (
          <InlineFieldset
            token={token}
            heading={heading}
            titleCaption={titleCaption}
          />
        ) : (
          <PageHeaderFieldset
            token={token}
            heading={heading}
            titleCaption={titleCaption}
          />
        )}
        {children}
      </div>
    </form>
  );
};

export default Form;
