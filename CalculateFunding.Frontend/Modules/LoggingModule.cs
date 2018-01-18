using CalculateFunding.Frontend.Core.Ioc;
using CalculateFunding.Frontend.Core.Logging;
using CalculateFunding.Frontend.Core.Middleware;
using CalculateFunding.Frontend.Core.Telemetry;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using CalculateFunding.Frontend.Options;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using Serilog.Core;
using Serilog.Events;
using System;

namespace CalculateFunding.Frontend.Modules
{
    public class LoggingModule : ServiceCollectionModuleBase
    {
        override public void Configure(IServiceCollection services)
        {
            ApplicationInsightsOptions appInsightsOptions = new ApplicationInsightsOptions();

            Configuration.Bind("ApplicationInsightsOptions", appInsightsOptions);

            services.AddSingleton<ApplicationInsightsOptions>(appInsightsOptions);

            services.AddScoped<ICorrelationIdProvider, HttpContextCorrelationIdProvider>();

            string serviceName = "CalculateFunding.Frontend";

            services.AddScoped<ILogger>(c => GetLoggerConfiguration(c.GetService<ICorrelationIdProvider>(), appInsightsOptions, serviceName).CreateLogger());


            services.AddScoped<CorrelationIdMiddleware>();

            services.AddScoped<ITelemetryInitializer, CorrelationIdTelemetryInitializer>();

            ServiceNameTelemetryInitializer serviceNameEnricher = new ServiceNameTelemetryInitializer(serviceName);

            services.AddSingleton<ITelemetryInitializer>(serviceNameEnricher);
        }

        public static LoggerConfiguration GetLoggerConfiguration(ICorrelationIdProvider correlationIdProvider, ApplicationInsightsOptions options, string serviceName)
        {
            if (correlationIdProvider == null)
            {
                throw new ArgumentNullException(nameof(correlationIdProvider));
            }
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
                new CorrelationIdLogEnricher(correlationIdProvider)
            }).Enrich.With(new ILogEventEnricher[]
            {
                new ServiceNameLogEnricher(serviceName)
            }).WriteTo.ApplicationInsightsTraces(new TelemetryConfiguration
            {
                InstrumentationKey = appInsightsKey,

            }, LogEventLevel.Verbose, null, null);
        }
    }
}
