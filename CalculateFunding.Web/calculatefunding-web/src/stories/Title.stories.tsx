import { Meta, Story } from "@storybook/react";
import React from "react";

import { Title, TitleProps } from "../components/Title";

export default {
  title: "CFS/Title",
  component: Title,
  argTypes: {},
} as Meta;

const Template: Story<TitleProps> = (args) => <Title {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  title: "Test text",
  description: "Test description",
  includeBackLink: false,
};
