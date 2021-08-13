import React, {useState} from 'react';
import {Story} from '@storybook/react';
import {SelectionField, SelectionFieldOption, SelectionFieldProps} from "../components/SelectionField";
import {ErrorMessage} from "../types/ErrorMessage";
import {convertCamelCaseToSpaceDelimited} from "../helpers/stringHelper";

const title = 'Forms/Components/SelectionField';
const component = SelectionField;

const Wrapper = (args: SelectionFieldProps) => {
    const [selectedValue, setSelectedValue] = useState<string | undefined>()
    const [errors, setErrors] = useState<ErrorMessage[] | undefined>()
    const options: SelectionFieldOption[] = [
        {id: 'id1', displayValue: 'option 1'},
        {id: 'id2', displayValue: 'option 2'},
    ];

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(e.target.value);
        if (e.target.value === options[1].id) {
            setErrors([{id: 1, fieldName: args.token, message: 'Invalid selection'}]);
        } else {
            setErrors([]);
        }
    }

    return (
        <form className='govuk-!-margin-4'>
            <div className='govuk-grid-row'>
                <h2 className='govuk-heading-l'>
                    {convertCamelCaseToSpaceDelimited(component.name)} Form Test
                </h2>
                <p className='govuk-body-m'>
                    Select option 2 to experience an error
                </p>
                <SelectionField {...args}
                                selectedValue={selectedValue}
                                changeSelection={handleChange}
                                token='token'
                                label='Select an option'
                                hint='Hint... read the label'
                                options={options}
                                errors={errors}
                />
            </div>
        </form>
    );
}

const Template: Story<SelectionFieldProps> = (args: SelectionFieldProps) => (
    <Wrapper {...args}/>
);

export const OpenWithContent = Template.bind({});

export default {
    title,
    component,
};

OpenWithContent.args = {} as SelectionFieldProps;
