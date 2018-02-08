namespace CalculateFunding.Frontend.Core.Telemetry
{
    using CalculateFunding.Frontend.Core.Logging;
    using CalculateFunding.Frontend.Helpers;
    using Microsoft.ApplicationInsights.Channel;
    using Microsoft.ApplicationInsights.Extensibility;

    public class ServiceNameTelemetryInitializer : ITelemetryInitializer
    {
        private string _serviceName;

        public ServiceNameTelemetryInitializer(string serviceName)
        {
            Guard.IsNullOrWhiteSpace(serviceName, nameof(serviceName));
            _serviceName = serviceName;
        }

        public void Initialize(ITelemetry telemetry)
        {
            if (!telemetry.Context.Properties.ContainsKey(LoggingConstants.ServiceNamePropertiesName))
            {
                telemetry.Context.Properties.Add(LoggingConstants.ServiceNamePropertiesName, _serviceName);
            }
        }
    }
}
