using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;

namespace CalculateFunding.Frontend.Extensions
{
    public static class HttpContextExtensions
    {
        public static string GetAntiforgeryToken(this HttpContext context)
        {
            var antiforgery = (IAntiforgery)context.RequestServices.GetService(typeof(IAntiforgery));
            var tokenSet = antiforgery.GetAndStoreTokens(context);
            return tokenSet.RequestToken;
        }
    }
}
