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

            return await ValidatedPostAsync<string, TemplateCreateCommand>(url, command);
        }

        public async Task<ValidatedApiResponse<string>> UpdateTemplateContent(TemplateContentUpdateCommand command)
        {
            string url = "templates/build/content";

            return await ValidatedPutAsync<string, TemplateContentUpdateCommand>(url, command);
        }

        public async Task<ValidatedApiResponse<string>> UpdateTemplateMetadata(TemplateMetadataUpdateCommand command)
        {
            string url = "templates/build/metadata";

            return await ValidatedPutAsync<string, TemplateMetadataUpdateCommand>(url, command);
        }
    }
}