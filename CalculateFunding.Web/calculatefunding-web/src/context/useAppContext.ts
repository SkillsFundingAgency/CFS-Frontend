import React from "react";
import {AppContext} from "./AppContext";

export const useAppContext = () => {
    const context = React.useContext(AppContext)
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContext Provider')
    }
    return context;
};
