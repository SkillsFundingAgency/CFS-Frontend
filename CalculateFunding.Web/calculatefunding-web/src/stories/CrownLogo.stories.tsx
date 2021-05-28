import React from 'react';
import { Story, Meta } from '@storybook/react';
import {CrownLogo} from "../components/CrownLogo";

export default {
    title: 'CFS/CrownLogo',
    component: CrownLogo,
} as Meta;

const Template: Story = (args) => <CrownLogo />;

export const Primary = Template.bind({});
