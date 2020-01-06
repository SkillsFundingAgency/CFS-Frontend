import * as React from "react";
import { useTabs } from "./Tabs";

export interface IPanelProps {
    label: string;
}

export const Panel: React.FC<IPanelProps> = props => {
    const { activeTab } = useTabs();
    return activeTab === props.label ? <div>{props.children}</div> : null;
};
