import "../styles/Tab.scss";

import * as React from "react";

import { useTabs } from "../hooks/useTabs";

export interface ITabProps {
  label: string;
  hidden?: boolean;
}

export const Tab: React.FC<ITabProps> = (props) => {
  const { activeTab, setActiveTab } = useTabs();

  const handleTabClick = () => {
    setActiveTab(props.label);
  };

  return (
    <li
      hidden={props.hidden}
      className={
        activeTab === props.label
          ? "govuk-tabs__list-item govuk-tabs__list-item--selected"
          : "govuk-tabs__list-item"
      }
    >
      <label className="govuk-tabs__tab" data-testid={`tab-${props.label}`} onClick={handleTabClick}>
        {props.children}
      </label>
    </li>
  );
};
