import React, {useState} from 'react';
import {Story} from '@storybook/react';
import {TextAreaField, TextAreaFieldProps} from "../components/TextAreaField";
import {ErrorMessage} from "../types/ErrorMessage";
import {convertCamelCaseToSpaceDelimited} from "../helpers/stringHelper";

const title = 'Forms/Components/TextAreaField';
const component = TextAreaField;

const Wrapper = (args: TextAreaFieldProps) => {
    const [selectedValue, setSelectedValue] = useState<string | undefined>()
    const [errors, setErrors] = useState<ErrorMessage[] | undefined>()

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSelectedValue(e.target.value);
        if (e.target.value === 'error') {
            setErrors([{id: 1, fieldName: args.token, message: 'Invalid value'}]);
        } else {
            setErrors([]);
        }
    }

    return (
        <form className='govuk-!-margin-4'>
            <div className='govuk-grid-row'>
                <h2 className='govuk-heading-l'>{convertCamelCaseToSpaceDelimited(component.name)} Form Test</h2>
                <p className='govuk-body-m'>
                    Type 'error' to experience an error
                </p>
                <TextAreaField {...args}
                           onChange={handleChange}
                           token='token'
                           label='Enter your favourite word'
                           value={selectedValue}
                           hint='Hint... read the dictionary'
                           errors={errors}
                />
            </div>
        </form>
    );
}

const Template: Story<TextAreaFieldProps> = (args: TextAreaFieldProps) => (
    <Wrapper {...args}/>
);

export const OpenWithContent = Template.bind({});

export default {
    title,
    component,
};

OpenWithContent.args = {} as TextAreaFieldProps;
