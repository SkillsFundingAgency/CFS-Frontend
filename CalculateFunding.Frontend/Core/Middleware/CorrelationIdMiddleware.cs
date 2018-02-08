namespace CalculateFunding.Frontend.Core.Middleware
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Core.Logging;
    using CalculateFunding.Frontend.Interfaces.Core.Logging;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.DependencyInjection;

    public class CorrelationIdMiddleware
    {
        private readonly RequestDelegate _next;

        public CorrelationIdMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public Task Invoke(HttpContext context)
        {
            var correlationIdProvider = context.RequestServices.GetService<ICorrelationIdProvider>();
            var correlationId = correlationIdProvider.GetCorrelationId();

            if (!context.Response.Headers.ContainsKey(LoggingConstants.CorrelationIdHttpHeaderName))
            {
                context.Response.Headers.Add(LoggingConstants.CorrelationIdHttpHeaderName, correlationId.ToLower());
            }

            return _next(context);
        }
    }
}
