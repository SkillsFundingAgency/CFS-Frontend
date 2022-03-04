import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import React, { createContext, useContext } from "react";

import { milliseconds } from "../../helpers/TimeInMs";

type SignalrProviderType = {
    hubConnection: HubConnection,
    stopSignalR: () => void,
    startSignalR: () => void,
    onSignalrEvent: (eventName:string, callback:any) => void,
    onSignalrClose: (callback:any) => void,
    onSignalrReconnecting: (callback:any) => void,
    onSignalrReconnected: (callback:any) => void
}

const signalrDefaultValues: SignalrProviderType = {
    hubConnection: new HubConnectionBuilder()
        .withUrl("/api/notifications")
        .withAutomaticReconnect([5, 8, 13])
        .configureLogging(LogLevel.Information)
        .build(),
    stopSignalR: () => { return {}; },
    startSignalR: () => {return {}; },
    onSignalrEvent: () => { return {}; },
    onSignalrClose: () => { return {}; },
    onSignalrReconnecting: () => { return {}; },
    onSignalrReconnected: () => { return {}; },
}

const SignalrContext = createContext<SignalrProviderType>(signalrDefaultValues);

export const SignalrProvider = ({ children }: { children: React.ReactNode }) => {
    const signalrProvider = useSignalrProvider();

    return <SignalrContext.Provider value={signalrProvider}>{children}</SignalrContext.Provider>
}

export const useSignalR = () => {
    return useContext(SignalrContext);
}

export const useSignalrProvider = () => {
    const hubConnection: HubConnection = new HubConnectionBuilder()
        .withUrl("/api/notifications")
        .withAutomaticReconnect([5, 8, 13])
        .configureLogging(LogLevel.Information)
        .build();

    hubConnection.keepAliveIntervalInMilliseconds = milliseconds.ThreeMinutes;
    hubConnection.serverTimeoutInMilliseconds = milliseconds.SixMinutes;

    const stopSignalR = async () => {
        console.log("SignalR: shutting down");
        await hubConnection.stop();
    };

    const startSignalR = async () => {
        console.log("SignalR: starting server");
        await hubConnection.start();
    };

    const onSignalrEvent = (eventName:string, callback:any) =>{
        console.log("Registering event " + eventName);
        hubConnection.on(eventName, callback);
    }

    const onSignalrClose = (callback:any) =>{
        console.log("Closing SignalR Connection")
        hubConnection.onclose(error => callback(error));
    }

    const onSignalrReconnecting = (callback:any) =>{
        console.log("Reconnecting SignalR")
        hubConnection.onreconnecting(error => callback(error));
    }

    const onSignalrReconnected = (callback:any) =>{
        console.log("Reconnected SignalR")
        hubConnection.onreconnected(callback);
    }

    return {
        hubConnection,
        stopSignalR,
        startSignalR,
        onSignalrEvent,
        onSignalrClose,
        onSignalrReconnecting,
        onSignalrReconnected
    }
}
