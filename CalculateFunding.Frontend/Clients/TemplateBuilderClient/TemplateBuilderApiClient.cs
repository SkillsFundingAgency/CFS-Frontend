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
using Microsoft.AspNetCore.WebUtilities;
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

        public async Task<ApiResponse<IEnumerable<TemplateResource>>> GetPublishedTemplatesByFundingStreamAndPeriod(string fundingStreamId,
            string fundingPeriodId)
        {
            string url = $"templates/build/versions/search";

            return await PostAsync<IEnumerable<TemplateResource>, FindTemplateVersionQuery>(url, new FindTemplateVersionQuery
            {
                FundingStreamId = fundingStreamId,
                FundingPeriodId = fundingPeriodId,
                Statuses = new List<TemplateStatus> {TemplateStatus.Published}
            });
        }

        public async Task<NoValidatedContentApiResponse> PublishTemplate(TemplatePublishModel model)
        {
            string url = $"templates/build/{model.TemplateId}/publish";
            
            return await ValidatedPostAsync(url, model);
        }

        public async Task<ApiResponse<TemplateVersionListResponse>> GetTemplateVersions(string templateId, 
            List<TemplateStatus> statuses,
            int page,
            int itemsPerPage)
        {
            Guard.ArgumentNotNull(templateId, nameof(templateId));
            string templateStatusesParam = string.Join(",", statuses);
            string url = $"templates/build/{templateId}/versions?page={page}&itemsPerPage={itemsPerPage}";
            if (!string.IsNullOrWhiteSpace(templateStatusesParam))
            {
                url += $"&statuses={templateStatusesParam}";
            }

            return await GetAsync<TemplateVersionListResponse>(url);
        }

        public async Task<ValidatedApiResponse<string>> CreateDraftTemplate(TemplateCreateCommand command)
        {
            string url = "templates/build";

            return await ValidatedPostAsync<string, TemplateCreateCommand>(url, command);
        }

        public async Task<ValidatedApiResponse<string>> CreateTemplateAsClone(TemplateCreateAsCloneCommand command)
        {
            string url = "templates/build/clone";

            return await ValidatedPostAsync<string, TemplateCreateAsCloneCommand>(url, command);
        }

        public async Task<ValidatedApiResponse<string>> UpdateTemplateContent(TemplateContentUpdateCommand command)
        {
            string url = "templates/build/content";

            return await ValidatedPutAsync<string, TemplateContentUpdateCommand>(url, command);
        }

        public async Task<ValidatedApiResponse<int>> RestoreContent(TemplateContentUpdateCommand command)
        {
            string url = $"templates/build/{command.TemplateId}/restore/{command.Version}";

            return await ValidatedPutAsync<int, TemplateContentUpdateCommand>(url, command);
        }

        public async Task<ValidatedApiResponse<string>> UpdateTemplateDescription(TemplateDescriptionUpdateCommand command)
        {
            string url = "templates/build/metadata";

            return await ValidatedPutAsync<string, TemplateDescriptionUpdateCommand>(url, command);
        }

        public async Task<ValidatedApiResponse<SearchResults<TemplateIndex>>> SearchTemplates(SearchModel request)
        {
            string url = "templates/templates-search";

            return await ValidatedPostAsync<SearchResults<TemplateIndex>, SearchModel>(url, request);
        }

        public async Task<ApiResponse<List<FundingStreamWithPeriods>>> GetFundingStreamPeriodsWithoutTemplates()
        {
            string url = "templates/build/available-stream-periods";

            return await GetAsync<List<FundingStreamWithPeriods>>(url);
        }
    }
}