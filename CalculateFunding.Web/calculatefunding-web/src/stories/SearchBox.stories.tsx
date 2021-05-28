import React from 'react';
import { Story, Meta } from '@storybook/react';
import {SearchBox, SearchBoxProps} from "../components/SearchBox";

export default {
    title: 'CFS/SearchBox',
    component: SearchBox,
} as Meta;

const Template: Story<SearchBoxProps> = (args) => <SearchBox {...args} />;

export const Primary = Template.bind({});
