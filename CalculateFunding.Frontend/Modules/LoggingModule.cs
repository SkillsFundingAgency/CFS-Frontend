﻿namespace CalculateFunding.Frontend.Modules
{
    using System;
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.Core.Logging;
    using CalculateFunding.Frontend.Core.Telemetry;
    using CalculateFunding.Frontend.Options;
    using Microsoft.ApplicationInsights.Extensibility;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Serilog;
    using Serilog.Core;

    public class LoggingModule : ServiceCollectionModuleBase
    {
        public static LoggerConfiguration GetLoggerConfiguration(ApplicationInsightsOptions options, string serviceName)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            string appInsightsKey = options.InstrumentationKey;

            if (string.IsNullOrWhiteSpace(appInsightsKey))
            {
                throw new InvalidOperationException("Unable to lookup Application Insights Configuration key from Configuration Provider. The value returned was empty string");
            }

            return new LoggerConfiguration().Enrich.With(new ILogEventEnricher[]
            {
                new ServiceNameLogEnricher(serviceName)
            }).WriteTo.ApplicationInsights(appInsightsKey, TelemetryConverter.Traces);
        }

        public override void Configure(IServiceCollection services)
        {
            ApplicationInsightsOptions appInsightsOptions = new ApplicationInsightsOptions();

            Configuration.Bind("ApplicationInsightsOptions", appInsightsOptions);

            services.AddSingleton(appInsightsOptions);

            string serviceName = "CalculateFunding.Frontend";

            services.AddSingleton<ILogger>(c => GetLoggerConfiguration(appInsightsOptions, serviceName).CreateLogger());

            ServiceNameTelemetryInitializer serviceNameEnricher = new ServiceNameTelemetryInitializer(serviceName);

            services.AddSingleton<ITelemetryInitializer>(serviceNameEnricher);

            // Add call to configure app insights, in order to have ITelemetryInitializer registered before calling
            // as per https://github.com/Microsoft/ApplicationInsights-aspnetcore/wiki/Custom-Configuration
            services.AddApplicationInsightsTelemetry(appInsightsOptions.InstrumentationKey);
        }
    }
}
