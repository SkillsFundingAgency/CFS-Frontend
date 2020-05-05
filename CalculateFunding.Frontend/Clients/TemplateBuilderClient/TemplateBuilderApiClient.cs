using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Interfaces;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models;
using CalculateFunding.Frontend.Interfaces;
using CalculateFunding.Frontend.ViewModels.TemplateBuilder;
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

        public async Task<ApiResponse<TemplateResource>> GetTemplate(string templateId)
        {
            string url = $"templates/build/{templateId}";

            return await GetAsync<TemplateResource>(url);
        }

        public async Task<ApiResponse<TemplateResource>> GetTemplateVersion(string templateId, string version)
        {
            string url = $"templates/build/{templateId}/versions/{version}";

            return await GetAsync<TemplateResource>(url);
        }

        public async Task<ApiResponse<List<TemplateVersionResource>>> GetTemplateVersions(string templateId, List<TemplateStatus> statuses)
        {
            Guard.ArgumentNotNull(templateId, nameof(templateId));
            string templateStatusesParam = string.Join(",", statuses);
            string url = $"templates/build/{templateId}/versions";
            if (!string.IsNullOrWhiteSpace(templateStatusesParam))
            {
                url += $"?statuses={templateStatusesParam}";
            }

            return await GetAsync<List<TemplateVersionResource>>(url);
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