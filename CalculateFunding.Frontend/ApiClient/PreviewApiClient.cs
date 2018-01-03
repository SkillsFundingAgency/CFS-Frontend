using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.APiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.ApiClient
{
    public class PreviewApiClient : AbstractApiClient, IPreviewApiClient
    {
        public PreviewApiClient(IOptionsSnapshot<AllocationApiOptions> options, IHttpClient httpClient, ILoggingService logs)
            : base(options, httpClient, logs)
        { }

        public async Task<ApiResponse<PreviewResponse>> PostPreview(PreviewRequest request)
        {
            return (await PostAsync<PreviewResponse, PreviewRequest>("api/v1/engine/preview", request).ConfigureAwait(false));
        }
    }
}
