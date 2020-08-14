using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
#pragma warning disable 1591

namespace CalculateFunding.Frontend.Extensions
{
    public static class HttpContextExtensions
    {
        private const string IfNoneMatch = "If-None-Match";

        public static string GetAntiforgeryToken(this HttpContext context)
        {
            IAntiforgery antiforgery = (IAntiforgery)context.RequestServices.GetService(typeof(IAntiforgery));
            AntiforgeryTokenSet tokenSet = antiforgery.GetAndStoreTokens(context);
            return tokenSet.RequestToken;
        }
        
        static readonly HashSet<string> CacheControlHeaders = new HashSet<string>
        {
            "Cache-Control",
            IfNoneMatch,
            "ETag"
        };

        public static void CopyCacheControlHeaders(this HttpResponse response,
            HttpHeaders headers)
        {
            if (headers == null)
            {
                return;
            }

            foreach (KeyValuePair<string,IEnumerable<string>> header in headers.Where(_ => CacheControlHeaders.Contains(_.Key)))
            {
                response.Headers[header.Key] = header.Value?.ToArray();
            }
        }

        public static string ReadETagHeaderValue(this HttpRequest request)
        {
            IHeaderDictionary headers = request?.Headers;

            if (headers == null)
            {
                return null;
            }

            return headers.TryGetValue(IfNoneMatch, out StringValues etags) ? etags.FirstOrDefault() : null;
        }
    }
}
