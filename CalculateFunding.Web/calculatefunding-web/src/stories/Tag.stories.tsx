import React from 'react';
import { Story, Meta } from '@storybook/react';
import {Tag, TagTypes} from "../components/Tag";


export default {
    title: 'CFS/Tag',
    component: Tag,
    argTypes:{

    }
} as Meta;

const Template: Story = (args) => <Tag {...args} />;

export const Default = Template.bind({});
Default.args = {
  text: "default",
  type: TagTypes.default
};

export const Alternative = Template.bind({});
Alternative.args = {
    text: "Alternative",
    type: TagTypes.red
};
