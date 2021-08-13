import React from "react";

export interface FormProps {
    token: string,
    heading: string,
    titleCaption?: string,
    onSubmit?: any,
    children: any
}

const Form = ({ token, heading, titleCaption, onSubmit, children }: FormProps) => {
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        onSubmit ? onSubmit() : e.preventDefault();
    }
    return (
        <form id={`form-${token}`}
              className="form"
              onSubmit={handleSubmit}
              noValidate={true}>
            <div className="govuk-form-group">
                <fieldset className="govuk-fieldset"
                          aria-describedby={`${token}-hint`}>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                        {titleCaption && <h3 className="govuk-caption-xl">{titleCaption}</h3>}
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