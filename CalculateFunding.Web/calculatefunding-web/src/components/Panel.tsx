import * as React from "react";
import { useTabs } from "./Tabs";

export interface IPanelProps {
    label: string;
    hidden?: boolean;
}

export const Panel: React.FC<IPanelProps> = props => {
    const { activeTab } = useTabs();
    return activeTab === props.label ? <div hidden={props.hidden}>{props.children}</div> : null;
};
