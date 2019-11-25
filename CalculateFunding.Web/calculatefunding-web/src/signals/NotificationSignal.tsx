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
                    console.log('Connection successful!');

                    hubConnect.on('NotificationEvent', (message: JobMessage) => {
                        console.log(message);

                        if (message.jobType === props.jobType && message.runningStatus === "Completed" && message.specificationId === props.jobId) {
                            console.log(message);
                            hubConnect.stop();
                            callback("IDLE");
                        }
                    });

                    if (props.jobId !== "") {
                        console.log(`Looking for job id ${props.jobId}`);
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
            <h1>{message}</h1>
            <h2>Please wait, this can take several minutes</h2>
            <img src="/assets/images/loading.svg" alt="Loading"/>
        </div>
    )
}