using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using CalculateFunding.Frontend.Core.Logging;

namespace CalculateFunding.Frontend.Core.Middleware
{
    public class CorrelationIdMiddleware
    {

        readonly RequestDelegate _next;

        public CorrelationIdMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public Task Invoke(HttpContext context)
        {
            var correlationIdProvider = context.RequestServices.GetService<ICorrelationIdProvider>();
            var correlationId = correlationIdProvider.GetCorrelationId();

            if (!context.Response.Headers.ContainsKey(LoggingConstants.CorrelationIdHttpHeaderName))
                context.Response.Headers.Add(LoggingConstants.CorrelationIdHttpHeaderName, correlationId.ToLower());

            return _next(context);
        }
    }
}
