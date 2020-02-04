import React, {useEffect, useState} from 'react';
import {HubConnection, HubConnectionBuilder} from "@aspnet/signalr";
import {JobMessage} from "../types/jobMessage";

export function NotificationSignal(props: { jobId: string, message: string, jobType: string, callback:any }) {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [hubConnection, setHubConnection] = useState<HubConnection>();
const callback = props.callback;

    // Set the Hub Connection on mount.
    useEffect(() => {
        if (props.jobId !== "") {
            // Set the initial SignalR Hub Connection.
            const createHubConnection = async () => {

                // Build new Hub Connection, url is currently hard coded.
                const hubConnect = new HubConnectionBuilder()
                    .withUrl('/api/notifications')
                    .build();
                try {
                    await hubConnect.start();

                    hubConnect.on('NotificationEvent', (message: JobMessage) => {
                        if (message.jobType === props.jobType && message.runningStatus === "Completed" && message.specificationId === props.jobId) {
                            hubConnect.stop();
                            callback();
                        }
                    });

                    if (props.jobId !== "") {
                        hubConnect.invoke("StartWatchingForSpecificationNotifications", props.jobId);
                    }

                } catch (err) {

                    alert(err);
                }
                setHubConnection(hubConnect);
            };

            createHubConnection();
        }
    }, [props.jobId, callback, props.jobType]);

    let message: string = props.message;
    return (
        <div className="center-block">
            <h1 className="govuk-heading-xl">{message}</h1>
            <h2 className="govuk-heading-l">Please wait, this can take several minutes</h2>
            <img src="/assets/images/loader.gif" alt="Loading"/>
        </div>
    )
}