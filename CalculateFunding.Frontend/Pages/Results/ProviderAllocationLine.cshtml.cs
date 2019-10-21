using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Providers;
using Serilog;

namespace CalculateFunding.Frontend.Pages.Results
{
    public class ProviderAllocationLinePageModel : ProviderResultsBasePageModel
    {
        private ILogger _logger;

        public ProviderAllocationLinePageModel(IResultsApiClient resultsApiClient, IProvidersApiClient providersApiClient, IPoliciesApiClient policiesApiClient, IMapper mapper, ISpecsApiClient specsApiClient, ILogger logger)
            : base(resultsApiClient, providersApiClient, policiesApiClient, mapper, specsApiClient, logger)
        {
            _logger = logger;
        }

        public override void PopulateResults(ApiResponse<ProviderResult> providerResponse)
        {
        }
    }
}