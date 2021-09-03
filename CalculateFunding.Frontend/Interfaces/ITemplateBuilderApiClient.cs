using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models;
using CalculateFunding.Frontend.ViewModels.TemplateBuilder;

namespace CalculateFunding.Frontend.Interfaces
{
    public interface ITemplateBuilderApiClient
    {
        Task<ValidatedApiResponse<string>> CreateDraftTemplate(TemplateCreateCommand command);
        Task<ValidatedApiResponse<string>> CreateTemplateAsClone(TemplateCreateAsCloneCommand command);
        Task<ValidatedApiResponse<string>> UpdateTemplateDescription(TemplateDescriptionUpdateCommand command);
        Task<ValidatedApiResponse<int>> UpdateTemplateContent(TemplateContentUpdateCommand command);
        Task<ValidatedApiResponse<int>> RestoreContent(TemplateContentUpdateCommand command);

        Task<ApiResponse<TemplateVersionListResponse>> GetTemplateVersions(
            string templateId,
            List<TemplateStatus> statuses,
            int page,
            int itemsPerPage);

        Task<ApiResponse<TemplateResource>> GetTemplate(string templateId);
        Task<ApiResponse<TemplateResource>> GetTemplateVersion(string templateId, string version);

        Task<ApiResponse<IEnumerable<TemplateResource>>> GetPublishedTemplatesByFundingStreamAndPeriod(
            string fundingStreamId, string fundingPeriodId);

        Task<NoValidatedContentApiResponse> PublishTemplate(TemplatePublishModel model);
        Task<ValidatedApiResponse<SearchResults<TemplateIndex>>> SearchTemplates(SearchModel request);
        Task<ApiResponse<List<FundingStreamWithPeriods>>> GetFundingStreamPeriodsWithoutTemplates();
    }
}