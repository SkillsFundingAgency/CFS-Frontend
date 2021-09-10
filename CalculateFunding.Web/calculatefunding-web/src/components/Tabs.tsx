import * as React from "react";

import { TabsContext } from "../hooks/useTabs";
import { IPanelProps, Panel } from "./Panel";
import { ITabProps, Tab } from "./Tab";

interface ITabsComposition {
  Tab: React.FC<ITabProps>;
  Panel: React.FC<IPanelProps>;
}

const Tabs: React.FC<{ initialTab: string }> & ITabsComposition = (props) => {
  const [activeTab, setActiveTab] = React.useState(props.initialTab);
  const memoizedContextValue = React.useMemo(
    () => ({
      activeTab,
      setActiveTab,
    }),
    [activeTab, setActiveTab]
  );

  return <TabsContext.Provider value={memoizedContextValue}>{props.children}</TabsContext.Provider>;
};

Tabs.Tab = Tab;
Tabs.Panel = Panel;

export { Tabs };
