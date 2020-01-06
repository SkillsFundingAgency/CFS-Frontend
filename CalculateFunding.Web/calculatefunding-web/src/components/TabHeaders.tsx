import * as React from "react";
import { useTabs } from "./Tabs";

export interface ITabProps {
    /**
     * Unique label of Tab to show when clicked.
     */
    label: string;
}

/**
 * This component allows changing of the active Tab.
 */
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

//  govuk-tabs__list-item--selected
//<ul className="govuk-tabs__list">
    //     <li className="govuk-tabs__list-item govuk-tabs__list-item--selected">
    //         <a className="govuk-tabs__tab" href="#template-calculations">
    //             Template calculations
    //         </a>
    //     </li>
    //     <li className="govuk-tabs__list-item">
    //         <a className="govuk-tabs__tab" href="#additional-calculations">
    //             Additional calculations
    //         </a>
    //     </li>
    // </ul>