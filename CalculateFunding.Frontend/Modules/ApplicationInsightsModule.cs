namespace CalculateFunding.Frontend.Modules
{
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.Core.Telemetry;
    using CalculateFunding.Frontend.Options;
    using Microsoft.ApplicationInsights.AspNetCore.Extensions;
    using Microsoft.ApplicationInsights.Extensibility;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;

    public class ApplicationInsightsModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            ApplicationInsightsOptions appInsightsOptions = new ApplicationInsightsOptions();

            Configuration.Bind("ApplicationInsightsOptions", appInsightsOptions);

            ServiceNameTelemetryInitializer serviceNameEnricher = new ServiceNameTelemetryInitializer("CalculateFunding.Frontend");

            services.AddSingleton<ITelemetryInitializer>(serviceNameEnricher);

            // Add call to configure app insights, in order to have ITelemetryInitializer registered before calling
            // as per https://github.com/Microsoft/ApplicationInsights-aspnetcore/wiki/Custom-Configuration
            services.AddApplicationInsightsTelemetry(new ApplicationInsightsServiceOptions()
            {
                InstrumentationKey = appInsightsOptions.InstrumentationKey,
                EnableAuthenticationTrackingJavaScript = true,
            });
        }
    }
}
