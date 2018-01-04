using CalculateFunding.Frontend.Interfaces.Core.Logging;
using CalculateFunding.Frontend.Options;
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.Extensions.Options;
using System;

namespace CalculateFunding.Frontend.Core.Logging
{
    public class ApplicationInsightsService : ILoggingService
    {
        TelemetryClient _telemetryClient;
        string _correlationId = Guid.NewGuid().ToString();

        readonly IOptionsSnapshot<ApplicationInsightsOptions> _appInsightsOptions;

        public ApplicationInsightsService(IOptionsSnapshot<ApplicationInsightsOptions> appInsightsOptions)
        {
            _appInsightsOptions = appInsightsOptions;
        }

        TelemetryClient TelemetryClient
        {
            get
            {
                if(_telemetryClient == null)
                {
                    _telemetryClient = new TelemetryClient
                    {
                        InstrumentationKey = _appInsightsOptions.Value.InstrumentationKey
                    };
                }

                return _telemetryClient;
            }
        }

        public string CorrelationId
        {
            get
            {
                return _correlationId;
            }
        }

        public void Trace(string message)
        {
            var traceTelmetry = new TraceTelemetry
            {
                Message = message,
                SeverityLevel = SeverityLevel.Information
            };

            traceTelmetry.Context.Operation.Id = _correlationId;

            TelemetryClient.TrackTrace(traceTelmetry);
        }

        public void Exception(string message, Exception exception)
        {
            var exceptionTelmetry = new ExceptionTelemetry
            {
                Message = message,
                SeverityLevel = SeverityLevel.Error,
                Exception = exception
            };

            exceptionTelmetry.Context.Operation.Id = _correlationId;

            TelemetryClient.TrackException(exceptionTelmetry);
        }

        public void FatalException(string message, Exception exception)
        {
            var exceptionTelmetry = new ExceptionTelemetry
            {
                Message = message,
                SeverityLevel = SeverityLevel.Critical,
                Exception = exception
            };

            exceptionTelmetry.Context.Operation.Id = _correlationId;

            TelemetryClient.TrackException(exceptionTelmetry);
        }


        //Add more logs here

    }
}
