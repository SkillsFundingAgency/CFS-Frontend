import * as React from "react";

import { useTabs } from "../hooks/useTabs";

export interface IPanelProps {
  label: string;
  hidden?: boolean;
}

export const Panel: React.FC<IPanelProps> = (props) => {
  const { activeTab } = useTabs();
  return activeTab === props.label ? (
    <div hidden={props.hidden} data-testid={`tab-panel-${props.label}`}>
      {props.children}
    </div>
  ) : null;
};
