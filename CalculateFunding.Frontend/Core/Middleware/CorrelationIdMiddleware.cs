using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

namespace CalculateFunding.Frontend.Core.Middleware
{
    public class CorrelationIdMiddleware
    {
        const string sfaCorellationId = "sfa-correlationId";

        readonly RequestDelegate _next;

        public CorrelationIdMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public Task Invoke(HttpContext context)
        {
            var correlationIdProvider = context.RequestServices.GetService<ICorrelationIdProvider>();
            var correlationId = correlationIdProvider.GetCorrelationId();

            if (!context.Response.Headers.ContainsKey(sfaCorellationId))
                context.Response.Headers.Add(sfaCorellationId, correlationId.ToLower());

            return _next(context);
        }
    }
}
