namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using AutoMapper;
    using Common.ApiClient.Models;
    using Common.ApiClient.Providers;
    using Common.ApiClient.Providers.Models;
    using Common.Utility;
    using Serilog;

    public class ProviderSearchService : IProviderSearchService
    {
        private IProvidersApiClient _providersApiClient;
        private ILogger _logger;

        public ProviderSearchService(IProvidersApiClient providersApiClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(providersApiClient, nameof(providersApiClient));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _providersApiClient = providersApiClient;
            _logger = logger;
        }

        public async Task<IEnumerable<ProviderVersionMetadata>> GetProviderVersionsByFundingStream(string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<IEnumerable<ProviderVersionMetadata>> providerVersionsResponse = await _providersApiClient.GetProviderVersionsByFundingStream(fundingStreamId);

            if (providerVersionsResponse?.Content == null)
            {
                _logger.Error("Get provider verions by funding stream HTTP request failed");
                return null;
            }

            return providerVersionsResponse.Content;
        }
    }
}
