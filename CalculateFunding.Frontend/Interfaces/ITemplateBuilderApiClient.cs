﻿using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.TemplateBuilderClient.Models;
using CalculateFunding.Frontend.ViewModels.TemplateBuilder;

namespace CalculateFunding.Frontend.Interfaces
{
    public interface ITemplateBuilderApiClient
    {
        Task<ApiResponse<string>> CreateDraftTemplate(TemplateCreateCommand command);
        Task<ValidatedApiResponse<string>> UpdateTemplateMetadata(TemplateMetadataUpdateCommand command);
        Task<ValidatedApiResponse<string>> UpdateTemplateContent(TemplateContentUpdateCommand command);
        Task<ApiResponse<List<TemplateVersionResource>>> GetTemplateVersions(string templateId, List<TemplateStatus> statuses);
    }
}