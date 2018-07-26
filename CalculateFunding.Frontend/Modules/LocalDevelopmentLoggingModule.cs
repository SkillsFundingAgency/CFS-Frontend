namespace CalculateFunding.Frontend.Modules
{
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.Core.Telemetry;
    using Microsoft.ApplicationInsights.Extensibility;
    using Microsoft.Extensions.DependencyInjection;
    using Serilog;

    public class LocalDevelopmentLoggingModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            string serviceName = "CalculateFunding.Frontend";

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
