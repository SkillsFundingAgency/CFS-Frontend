import * as React from "react";
import { useTabs } from "./Tabs";

export interface ITabProps {
    label: string;
}

export const Tab: React.FC<ITabProps> = props => {
    const { activeTab, setActiveTab } = useTabs();
    return (
        <li className={activeTab === props.label ? "govuk-tabs__list-item govuk-tabs__list-item--selected" : "govuk-tabs__list-item"}>
            <label className="govuk-tabs__tab" onClick={() => setActiveTab(props.label)}>
                {props.children}
            </label>
        </li>
    );
};