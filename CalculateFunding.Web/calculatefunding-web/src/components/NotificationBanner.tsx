import React, { useState } from "react";
import styled from "styled-components";

import { Tag, TagTypes } from "./Tag";

export interface NotificationBannerProps {
  title: string;
  token?: string;
  status?: NotificationStatus;
  isCollapsible?: boolean;
  children: any;
}

export enum NotificationStatus {
  Information = "Information",
  Success = "Success",
  Failed = "Failed",
  Attention = "Attention",
}

export function NotificationBanner({
  title,
  token = "notification-banner",
  status = NotificationStatus.Information,
  isCollapsible = false,
  children,
}: NotificationBannerProps): JSX.Element {
  const [isExpanded, toggleExpanded] = useState(false);

  const statusColour =
    status === NotificationStatus.Success
      ? colours.green
      : status === NotificationStatus.Attention
      ? colours.orange
      : status === NotificationStatus.Failed
      ? colours.red
      : colours.blue;

  return (
    <NotificationBannerContainer
      statusColour={statusColour}
      id={token}
      data-testid={token}
      role="alert"
      aria-labelledby="notification-banner-title"
      data-module="govuk-notification-banner"
    >
      <NotificationBannerHeader>
        <GridRow>
          <GridColumnThreeQuarters>
            {status !== NotificationStatus.Information && (
              <Tag
                text={status}
                type={
                  status === NotificationStatus.Success
                    ? TagTypes.green
                    : status === NotificationStatus.Failed
                    ? TagTypes.red
                    : status === NotificationStatus.Attention
                    ? TagTypes.orange
                    : TagTypes.blue
                }
              />
            )}
            <NotificationBannerHeading id="notification-banner-title">{title}</NotificationBannerHeading>
          </GridColumnThreeQuarters>
          {!!isCollapsible && (
            <GridColumnOneQuarters>
              <ExpandButton onClick={() => toggleExpanded((prevState) => !prevState)}>
                {isExpanded ? "Read less" : "Read more"}
              </ExpandButton>
            </GridColumnOneQuarters>
          )}
        </GridRow>
      </NotificationBannerHeader>
      <NotificationBannerContent aria-expanded={!isCollapsible || isExpanded}>
        {children}
      </NotificationBannerContent>
    </NotificationBannerContainer>
  );
}

const colours = {
  green: "#00703c",
  darkGreen: "#004e2a",
  red: "#d4351c",
  blue: "#1d70b8",
  darkBlue: "#003078",
  black: "#0b0c0c",
  yellow: "#fd0",
  orange: "#f47738",
};

const NotificationBannerContainer = styled.div<{ statusColour: string }>`
  font-family: "GDS Transport", arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 400;
  font-size: 16px;
  font-size: 1rem;
  line-height: 1.25;
  margin-bottom: 1rem;
  padding: 10px;
  border: 5px solid ${(props) => props.statusColour};

  @media print {
    font-family: sans-serif;
    font-size: 14pt;
    line-height: 1.15;
  }

  @media (min-width: 40.0625em) {
    font-size: 19px;
    font-size: 1.1875rem;
    line-height: 1.31579;
    margin-bottom: 1rem;
  }

  &:focus {
    outline: 3px solid ${colours.yellow};
  }
`;

const NotificationBannerHeader = styled.div`
  border-bottom: 1px solid transparent;
`;
const GridRow = styled.div`
  margin-right: -15px;
  margin-left: -15px;

  &:after {
    content: "";
    display: block;
    clear: both;
  }
`;
const GridColumnThreeQuarters = styled.div`
  width: 75%;
  float: left;
  box-sizing: border-box;
  padding: 0 15px;
`;
const GridColumnOneQuarters = styled.div`
  width: 25%;
  float: left;
  box-sizing: border-box;
  padding: 0 15px;
`;

const ButtonAsLink = styled.button`
  background: none;
  border: none;
  text-decoration: underline;
  cursor: pointer;
`;

const ExpandButton = styled(ButtonAsLink)`
  font-family: "GDS Transport", arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  float: right;
  cursor: pointer;
  text-decoration: underline;
  color: ${colours.blue};

  &:focus {
    outline: 3px solid transparent;
    color: ${colours.black};
    background-color: ${colours.yellow};
    -webkit-box-shadow: 0 -2px ${colours.yellow}, 0 4px ${colours.black};
    box-shadow: 0 -2px ${colours.yellow}, 0 4px ${colours.black};
    text-decoration: none;
  }

  @media (min-width: 40.0625em) {
    font-size: 19px;
    font-size: 1.1875rem;
    line-height: 1.31579;
  }
`;

const NotificationBannerHeading = styled.p`
  display: inline;
  font-family: "GDS Transport", arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 700;
  font-size: 18px;
  font-size: 1.125rem;
  line-height: 1.11111;
  padding: 0;
  margin: 0;

  @media print {
    font-family: sans-serif;
  }

  @media (min-width: 40.0625em) {
    font-size: 24px;
    font-size: 1.5rem;
    line-height: 1.25;
  }

  @media print {
    font-size: 18pt;
    line-height: 1.15;
  }
`;

const NotificationBannerContent = styled.div`
  color: ${colours.black};
  padding: 0;
  margin: 0;
  background-color: #fff;

  @media print {
    color: #000;
  }

  > * {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    max-width: 1200px;
    &:last-child {
      padding-top: 15px;
      margin-bottom: 0;
    }
  }

  &[aria-expanded="false"] {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.8s cubic-bezier(0, 1, 0, 1);
  }
  &[aria-expanded="true"] {
    overflow: hidden;
    max-height: 1000px;
    transition: max-height 1s ease-in-out;
  }
`;
