using System.Net.Http;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Interfaces;
using CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models;
using CalculateFunding.Frontend.Interfaces;
using Serilog;

namespace CalculateFunding.Frontend.Clients.TemplateBuilderClient
{
    // TODO: move to Common's PolicyApiClient once the dust settles
    public class TemplateBuilderApiClient : BaseApiClient, ITemplateBuilderApiClient
    {
        public TemplateBuilderApiClient(IHttpClientFactory httpClientFactory, ILogger logger,
            ICancellationTokenProvider cancellationTokenProvider = null)
            : base(httpClientFactory, HttpClientKeys.Policies, logger, cancellationTokenProvider)
        {
        }

        public async Task<ApiResponse<string>> CreateDraftTemplate(TemplateCreateCommand command)
        {
            string url = "templates/build";

            return await PostAsync<string, TemplateCreateCommand>(url, command);
        }
    }
}