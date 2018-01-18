namespace CalculateFunding.Frontend.Core.Logging
{
    /// <summary>
    /// Logging Constants
    /// </summary>
    public static class LoggingConstants
    {
        /// <summary>
        /// Property Name in Application Insights for Correlation ID
        /// </summary>
        public const string CorrelationIdPropertyName = "CorrelationId";

        /// <summary>
        /// HTTP Header Name for Correlation ID
        /// </summary>
        public const string CorrelationIdHttpHeaderName = "sfa-correlationId";

        /// <summary>
        /// Property Name in Application Insights for currently running service
        /// </summary>
        public const string ServiceNamePropertiesName = "Service";

    }
}
