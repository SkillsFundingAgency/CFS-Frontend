import {ApplicationInsights} from "@microsoft/applicationinsights-web";
import {Config} from '../types/Config';

export async function initialiseAppInsights() {
    const configuration: Config = await (window as any)['configuration'];

    if ((window as any).appInsights || configuration.appInsightsKey.trim().length === 0) return;

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