using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Serilog.Core;
using Serilog.Events;
using System;

namespace CalculateFunding.Frontend.Core.Logging
{
    public class CorrelationIdLogEnricher : ILogEventEnricher
    {
        private ICorrelationIdProvider _correlationIdProvider;

        public CorrelationIdLogEnricher(ICorrelationIdProvider correlationIdProvider)
        {
            if (correlationIdProvider == null)
            {
                throw new ArgumentNullException(nameof(correlationIdProvider));
            }
            _correlationIdProvider = correlationIdProvider;
        }

        public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
        {
            if (logEvent == null)
            {
                throw new ArgumentNullException(nameof(logEvent));
            }
            if (propertyFactory == null)
            {
                throw new ArgumentNullException(nameof(propertyFactory));
            }
            string value = _correlationIdProvider.GetCorrelationId();

            if (!string.IsNullOrWhiteSpace(value))
            {
                LogEventProperty property = propertyFactory.CreateProperty("CorrelationId", value, false);
                logEvent.AddOrUpdateProperty(property);
            }
        }
    }
}
