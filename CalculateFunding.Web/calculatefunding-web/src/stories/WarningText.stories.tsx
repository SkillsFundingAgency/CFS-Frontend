import React from 'react';
import {Story, Meta} from '@storybook/react';

import {WarningText, WarningTextProps} from "../components/WarningText";

export default {
    title: 'CFS/WarningText',
    component: WarningText,
    argTypes: {
    },
} as Meta;

const Template: Story<WarningTextProps> = (args) => <WarningText {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    hidden: false,
    text: "You can be fined up to £5,000 if you do not register.",
    className: ""
};

export const Secondary = Template.bind({});
Secondary.args = {
    hidden: true,
    text: "This text is not visible on standard load",
    className: ""
};
