namespace CalculateFunding.Frontend.Core.Telemetry
{
    using System;
    using CalculateFunding.Frontend.Core.Logging;
    using CalculateFunding.Frontend.Helpers;
    using Microsoft.ApplicationInsights.Channel;
    using Microsoft.ApplicationInsights.Extensibility;
    using Microsoft.AspNetCore.Http;

    public class CorrelationIdTelemetryInitializer : ITelemetryInitializer
    {
        private IHttpContextAccessor _httpContextAccessor;

        public CorrelationIdTelemetryInitializer(IHttpContextAccessor httpContextAccessor)
        {
            Guard.ArgumentNotNull(httpContextAccessor, nameof(httpContextAccessor));
            _httpContextAccessor = httpContextAccessor;
        }

        public void Initialize(ITelemetry telemetry)
        {
            string correlationId;
            if (_httpContextAccessor.HttpContext != null)
            {
                if (_httpContextAccessor.HttpContext.Response.Headers.ContainsKey(LoggingConstants.CorrelationIdHttpHeaderName))
                {
                    correlationId = _httpContextAccessor.HttpContext.Response.Headers[LoggingConstants.CorrelationIdHttpHeaderName];
                }
                else
                {
                    correlationId = Guid.NewGuid().ToString();
                    if (!_httpContextAccessor.HttpContext.Response.HasStarted)
                    {
                        _httpContextAccessor.HttpContext.Response.Headers.Add(LoggingConstants.CorrelationIdHttpHeaderName, correlationId);
                    }
                    else
                    {
                        return;
                    }
                }

                if (!telemetry.Context.Properties.ContainsKey(LoggingConstants.CorrelationIdPropertyName))
                {
                    telemetry.Context.Properties.Add(LoggingConstants.CorrelationIdPropertyName, correlationId);
                }
                else if (correlationId != telemetry.Context.Properties[LoggingConstants.CorrelationIdPropertyName])
                {
                     telemetry.Context.Properties[LoggingConstants.CorrelationIdPropertyName] = correlationId;
                    //throw new InvalidOperationException("Correlation ID Conflict");
                }
            }
        }
    }
}
