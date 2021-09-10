import { Meta, Story } from "@storybook/react";
import React from "react";

import { CrownLogo } from "../components/CrownLogo";

export default {
  title: "CFS/CrownLogo",
  component: CrownLogo,
} as Meta;

const Template: Story = (args) => <CrownLogo />;

export const Primary = Template.bind({});
