namespace CalculateFunding.Frontend.Modules
{
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.Core.Logging;
    using CalculateFunding.Frontend.Core.Middleware;
    using CalculateFunding.Frontend.Core.Telemetry;
    using CalculateFunding.Frontend.Interfaces.Core.Logging;
    using Microsoft.ApplicationInsights.Extensibility;
    using Microsoft.Extensions.DependencyInjection;
    using Serilog;

    public class LocalDevelopmentLoggingModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            services.AddScoped<ICorrelationIdProvider, HttpContextCorrelationIdProvider>();

            string serviceName = "CalculateFunding.Frontend";

            services.AddScoped<CorrelationIdMiddleware>();

            services.AddScoped<ITelemetryInitializer, CorrelationIdTelemetryInitializer>();

            ServiceNameTelemetryInitializer serviceNameEnricher = new ServiceNameTelemetryInitializer(serviceName);

            services.AddSingleton<ITelemetryInitializer>(serviceNameEnricher);

            ILogger logger = new LoggerConfiguration()
                .MinimumLevel.Verbose()
                .WriteTo
                .Console(Serilog.Events.LogEventLevel.Verbose)
                .CreateLogger();

            services.AddSingleton(logger);
        }
    }
}
