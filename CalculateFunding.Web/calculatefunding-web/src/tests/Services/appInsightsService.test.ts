import {initialiseAppInsights, setAppInsightsAuthenticatedUser} from "../../services/appInsightsService";
import {ApplicationInsights} from "@microsoft/applicationinsights-web";

describe("AppInsightsService tests ", () => {
    beforeEach(() => {
        window = Object.create(window);

        Object.defineProperty(window, 'configuration', {
            value: expectedConfig
        });
    });

    describe("InitialiseAppInsights should ", () => {
        it("not have appInsights given appInsights is not initialised", async () => {
            const ai = (window as any).appInsights;
            expect(ai).toBeUndefined()
        });

        it("have appInsights given appInsights is initialised", async () => {
            await initialiseAppInsights();
            const ai = (window as any).appInsights;
            expect(ai).not.toBeUndefined()
        });

        it("have appInsights configuration given appInsights is initialised", async () => {
            await initialiseAppInsights();
            const ai = (window as any).appInsights;
            const appInsightsConfig = new ApplicationInsights({
                config: {
                    instrumentationKey: expectedConfig.appInsightsKey,
                    maxBatchInterval: 0,
                    disableFetchTracking: true,
                    disableExceptionTracking: false,
                    disableTelemetry: false,
                    enableUnhandledPromiseRejectionTracking: true,
                    enableAutoRouteTracking: true
                }});

            expect(ai.config.instrumentationKey).toBe(appInsightsConfig.config.instrumentationKey);
            expect(ai.config.maxBatchInterval).toBe(appInsightsConfig.config.maxBatchInterval);
            expect(ai.config.disableFetchTracking).toBe(appInsightsConfig.config.disableFetchTracking);
            expect(ai.config.disableExceptionTracking).toBe(appInsightsConfig.config.disableExceptionTracking);
            expect(ai.config.disableTelemetry).toBe(appInsightsConfig.config.disableTelemetry);
            expect(ai.config.enableUnhandledPromiseRejectionTracking).toBe(appInsightsConfig.config.enableUnhandledPromiseRejectionTracking);
            expect(ai.config.enableAutoRouteTracking).toBe(appInsightsConfig.config.enableAutoRouteTracking);
        });
    });

    describe("SetAppInsightsAuthenticatedUser should ", () => {
        it("initialise appInsights given appInsights is not already initialised", async () => {
            await setAppInsightsAuthenticatedUser("test-user-name");
            const ai = (window as any).appInsights;
            expect(ai).not.toBeUndefined()
        });

        it("set username once appInsights is initialised", async () => {
            await setAppInsightsAuthenticatedUser("test-user-name");
            const ai = (window as any).appInsights;
            expect(ai.context.user.authenticatedId).toBe("test-user-name");
        });
    });
});

const expectedConfig = {
    loginType: "",
    baseUrl: "",
    debugOn: true,
    tracingOn: true,
    appInsightsKey: "test-key"
};