import React, {useEffect, useState} from 'react';
import {HubConnection, HubConnectionBuilder} from "@aspnet/signalr";


export function NotificationSignal(props: { jobId: string, message: string }) {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [hubConnection, setHubConnection] = useState<HubConnection>();

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

                    hubConnect.on('NotificationEvent', (message) => {
                        console.log(message);
                    });
                    if (props.jobId !== "") {
                        console.log(`Looking for job id ${props.jobId}`);
                        hubConnect.invoke("StartWatchingForSpecificationNotifications", props.jobId);
                    }
                    //hubConnect.invoke("StartWatchingForAllNotifications");

                } catch (err) {
                    alert(err);
                }
                setHubConnection(hubConnect);
            };

            createHubConnection();
        }
    }, [props.jobId]);

    let message:string = props.message;
    return (
        <div className="valign-middle">
            <h1>{message}</h1>
            <h2>Please wait, this can take several minutes</h2>
            <img src="/assets/images/loading.svg" alt="Loading"/>
        </div>
    )
}