import * as React from 'react';
import {Tab, ITabProps} from './Tab';
import {Panel, IPanelProps} from './Panel';
import {TabsContext} from '../hooks/useTabs';

interface ITabsComposition {
    Tab: React.FC<ITabProps>;
    Panel: React.FC<IPanelProps>;
}

const Tabs: React.FC<{initialTab: string}> & ITabsComposition = props => {
    const [activeTab, setActiveTab] = React.useState(props.initialTab);
    const memoizedContextValue = React.useMemo(
        () => ({
            activeTab,
            setActiveTab,
        }),
        [activeTab, setActiveTab],
    );

    return (
        <TabsContext.Provider value={memoizedContextValue}>
            {props.children}
        </TabsContext.Provider>
    );
};

Tabs.Tab = Tab;
Tabs.Panel = Panel;

export {Tabs};