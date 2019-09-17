using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.TemplateMetadata.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Interfaces.Services;
using Serilog;

namespace CalculateFunding.Frontend.Services
{
    public class TemplateMetadataContentsAssemblerService : ITemplateMetadataContentsAssemblerService
    {
        private readonly IPoliciesApiClient _policiesApiClient;
        private readonly ILogger _logger;

        public TemplateMetadataContentsAssemblerService(
            IPoliciesApiClient policiesApiClient, 
            ILogger logger)
        {
            Guard.ArgumentNotNull(policiesApiClient, nameof(policiesApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _policiesApiClient = policiesApiClient;
            _logger = logger;
        }

        public async Task<IDictionary<string, TemplateMetadataContents>> Assemble(SpecificationSummary specification)
        {
            Guard.ArgumentNotNull(specification, nameof(specification));

            IDictionary<string, TemplateMetadataContents> templateMetadataContentsCollection = new Dictionary<string, TemplateMetadataContents>();

            foreach(Reference fundingStreamReference in specification.FundingStreams)
            {
                string fundingStreamId = fundingStreamReference.Id;

                if (!specification.TemplateIds.ContainsKey(fundingStreamId))
                {
                    string errorMessage = $"Template version for funding stream id '{fundingStreamId}' not found for specification with id '{specification.Id}'";

                    _logger.Error(errorMessage);
                }
                else
                {
                    string templateVersion = specification.TemplateIds[fundingStreamId];

                    ApiResponse<TemplateMetadataContents> templateMetadataContentsResponse = await _policiesApiClient.GetFundingTemplateContents(fundingStreamId, templateVersion);

                    //AB: We will need to revisit this and throw an exception here but while the data is a bit naf 
                    //just want to make sure we can load the page while testing

                    if (templateMetadataContentsResponse != null && templateMetadataContentsResponse.StatusCode.IsSuccess())
                    {
                        templateMetadataContentsCollection.Add(fundingStreamId, templateMetadataContentsResponse.Content);
                    }
                }
            }

            return templateMetadataContentsCollection;
        }
    }
}
