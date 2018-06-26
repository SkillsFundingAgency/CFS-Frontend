namespace CalculateFunding.Frontend.Core.Logging
{
    using System;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.Core.Logging;
    using Microsoft.AspNetCore.Http;

    public class HttpContextCorrelationIdProvider : ICorrelationIdProvider
    {
        private IHttpContextAccessor _httpContextAccessor;

        public HttpContextCorrelationIdProvider(IHttpContextAccessor contextAccessor)
        {
            Guard.ArgumentNotNull(contextAccessor, nameof(contextAccessor));

            _httpContextAccessor = contextAccessor;
        }

        public string GetCorrelationId()
        {
            if (_httpContextAccessor.HttpContext.Response.Headers.ContainsKey(LoggingConstants.CorrelationIdHttpHeaderName))
            {
                return _httpContextAccessor.HttpContext.Response.Headers[LoggingConstants.CorrelationIdHttpHeaderName];
            }
            else
            {
                string correlationId = Guid.NewGuid().ToString();
                SetCorrelationId(correlationId);
                return correlationId;
            }
        }

        public void SetCorrelationId(string correlationId)
        {
            Guard.IsNullOrWhiteSpace(correlationId, nameof(correlationId));

            _httpContextAccessor.HttpContext.Response.Headers.Add(LoggingConstants.CorrelationIdHttpHeaderName, correlationId);
        }
    }
}
