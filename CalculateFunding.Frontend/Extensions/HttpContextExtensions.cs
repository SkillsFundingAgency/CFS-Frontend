using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;

namespace CalculateFunding.Frontend.Extensions
{
    public static class HttpContextExtensions
    {
        public static string GetAntiforgeryToken(this HttpContext context)
        {
            IAntiforgery antiforgery = (IAntiforgery)context.RequestServices.GetService(typeof(IAntiforgery));
            AntiforgeryTokenSet tokenSet = antiforgery.GetAndStoreTokens(context);
            return tokenSet.RequestToken;
        }
    }
}
