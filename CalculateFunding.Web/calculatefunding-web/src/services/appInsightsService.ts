import {ApplicationInsights} from "@microsoft/applicationinsights-web";
import {Config} from '../types/Config';

export async function initialiseAppInsights() {
    const configuration: Config = await (window as any)['configuration'];

    if ((window as any).appInsights || configuration == null || configuration.appInsightsKey.trim().length === 0) return;

    const ai = new ApplicationInsights({
        config: {
            instrumentationKey: configuration.appInsightsKey,
            maxBatchInterval: 0,
            disableFetchTracking: true,
            disableExceptionTracking: false,
            disableTelemetry: false,
            enableUnhandledPromiseRejectionTracking: true,
            enableAutoRouteTracking: true
        }
    });

    ai.loadAppInsights();
    ai.addTelemetryInitializer((envelope) => {
        if (!envelope || !envelope.data) return;
        envelope.data["Service"] = 'CalculateFunding.SPA';
    });
    ai.trackPageView();

    (window as any).appInsights = ai;
}

export async function setAppInsightsAuthenticatedUser(user: string) {
    if (!(window as any).appInsights)
    {
        await initialiseAppInsights();
    }
    await setAppInsightsAuthenticatedUserContext(user);
}

async function setAppInsightsAuthenticatedUserContext(user: string)
{
    const ai = (window as any).appInsights;
    ai.setAuthenticatedUserContext(user.replace(/[,;=| ]+/g, "_"), null, true);
    (window as any).appInsights = ai;
}