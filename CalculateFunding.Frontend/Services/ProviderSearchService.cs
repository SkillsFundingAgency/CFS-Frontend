namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Common.ApiClient.Providers.Models;
    using CalculateFunding.Common.ApiClient.Providers.Models.Search;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Serilog;

    public class ProviderSearchService : IProviderSearchService
    {
        private IProvidersApiClient _providersApiClient;
        private IMapper _mapper;
        private ILogger _logger;

        public ProviderSearchService(IProvidersApiClient providersApiClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(providersApiClient, nameof(providersApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _providersApiClient = providersApiClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<ProviderVersionMetadata>> GetProviderVersionsByFundingStream(string fundingStreamId)
        {
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
