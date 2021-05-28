import React from 'react';
import {Story, Meta} from '@storybook/react';
import {TimeInput, TimeInputProps} from "../components/TimeInput";

export default {
    title: 'CFS/TimeInput',
    component: TimeInput,
    argTypes: {
    },
} as Meta;

const Template: Story<TimeInputProps> = (args) => <TimeInput {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    time: '10',
    inputName: 'test-input',
    callback: () => {}
};
