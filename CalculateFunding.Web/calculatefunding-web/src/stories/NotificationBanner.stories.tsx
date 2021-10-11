import { Story } from "@storybook/react";
import React from "react";

import {
  NotificationBanner,
  NotificationBannerProps,
  NotificationStatus,
} from "../components/NotificationBanner";

export default {
  title: "Components/NotificationBanner",
  component: NotificationBanner,
};

const Wrapper = (args: NotificationBannerProps) => {
  return (
    <div className="govuk-grid-row">
      <h2 className="govuk-heading-l">Notification Banner Test</h2>
      <NotificationBanner {...args}>{args.children}</NotificationBanner>
    </div>
  );
};

const Template: Story<NotificationBannerProps> = (args: NotificationBannerProps) => (
  <Wrapper {...args}>{args.children}</Wrapper>
);

export const WithoutCollapsibleToggle = Template.bind({});

WithoutCollapsibleToggle.args = {
  title: "Notification Title",
  token: "token",
  status: NotificationStatus.Information,
  children: <div>Change the status below to change the colour of this notification banner</div>,
} as NotificationBannerProps;

export const WithCollapsibleToggle = Template.bind({});

WithCollapsibleToggle.args = {
  title: "Collapsible Notification Title",
  token: "token",
  isCollapsible: true,
  status: NotificationStatus.Success,
  children: (
    <div>
      <p className="govuk-body-m">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec nibh lacus.
      </p>
      <p>
        <strong>Change the status below to change the colour of this notification banner</strong>
      </p>
      <div>
        <p className="govuk-body-m">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec nibh lacus.
        </p>
      </div>
    </div>
  ),
} as NotificationBannerProps;
