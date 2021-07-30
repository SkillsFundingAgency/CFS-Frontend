import React from "react";
import {AppContextState} from "./states";
import {AppContext, AppContextProps} from "./AppContext";
import {appContextEventReducer} from "./appContextEventReducer";

export const AppContextWrapper = ({children}: AppContextProps) => {
    const [state, dispatch] = React.useReducer(appContextEventReducer, {} as AppContextState)
    const contextValue = React.useMemo(() => {
        return { state, dispatch };
    }, [state, dispatch]);
    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
};