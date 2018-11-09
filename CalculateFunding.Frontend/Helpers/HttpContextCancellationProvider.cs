using System.Threading;
using CalculateFunding.Common.ApiClient.Interfaces;
using CalculateFunding.Common.Utility;
using Microsoft.AspNetCore.Http;

namespace CalculateFunding.Frontend.Helpers
{
    public class HttpContextCancellationProvider : ICancellationTokenProvider
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public HttpContextCancellationProvider(IHttpContextAccessor httpContextAccessor)
        {
            Guard.ArgumentNotNull(httpContextAccessor, nameof(httpContextAccessor));

            _httpContextAccessor = httpContextAccessor;
        }

        public CancellationToken CurrentCancellationToken()
        {
            return _httpContextAccessor.HttpContext.RequestAborted;
        }
    }
}
