import React from "react";

export interface FormProps {
    token: string,
    heading: string,
    onSubmit: any,
    children: any
}

const Form = ({ token, heading, onSubmit, children }: FormProps) => {
    return (
        <form id={`form-${token}`}
              className="form"
              onSubmit={onSubmit}
              noValidate={true}>
            <div className="govuk-form-group">
                <fieldset className="govuk-fieldset"
                          aria-describedby={`${token}-hint`}>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        <h1 className="govuk-fieldset__heading">
                            {heading}
                        </h1>
                    </legend>
                </fieldset>
                {children}
            </div>
        </form>
    );
};

export default Form;