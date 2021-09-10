import { Story } from "@storybook/react";
import React, { useState } from "react";

import { TextField, TextFieldProps } from "../components/TextField";
import { convertCamelCaseToSpaceDelimited } from "../helpers/stringHelper";
import { ErrorMessage } from "../types/ErrorMessage";

const title = "Forms/Components/TextField";
const component = TextField;

const Wrapper = (args: TextFieldProps) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>();
  const [errors, setErrors] = useState<ErrorMessage[] | undefined>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(e.target.value);
    if (e.target.value === "error") {
      setErrors([{ id: 1, fieldName: args.token, message: "Invalid value" }]);
    } else {
      setErrors([]);
    }
  };

  return (
    <form className="govuk-!-margin-4">
      <div className="govuk-grid-row">
        <h2 className="govuk-heading-l">{convertCamelCaseToSpaceDelimited(component.name)} Form Test</h2>
        <p className="govuk-body-m">Type 'error' to experience an error</p>
        <TextField
          {...args}
          onChange={handleChange}
          token="token"
          label="Enter your favourite word"
          value={selectedValue}
          hint="Hint... read the dictionary"
          errors={errors}
        />
      </div>
    </form>
  );
};

const Template: Story<TextFieldProps> = (args: TextFieldProps) => <Wrapper {...args} />;

export const OpenWithContent = Template.bind({});

export default {
  title,
  component,
};

OpenWithContent.args = {} as TextFieldProps;
