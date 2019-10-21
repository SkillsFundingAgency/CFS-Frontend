using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;

namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Policies;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Common.ApiClient.Specifications;
    using CalculateFunding.Common.FeatureToggles;
    using Serilog;

    public class ProviderSummaryPageModel : ProviderResultsBasePageModel
    {
        private IFeatureToggle _featureToggle;

        public ProviderSummaryPageModel(IResultsApiClient resultsApiClient, IProvidersApiClient providersApiClient, IPoliciesApiClient policiesApiClient, ISpecsApiClient specsApiClient, IMapper mapper, ILogger logger, IFeatureToggle featureToggle)
            : base(resultsApiClient, providersApiClient, policiesApiClient, mapper, specsApiClient, logger)
        {
            _featureToggle = featureToggle;
        }

        public override void PopulateResults(ApiResponse<ProviderResult> providerResponse)
        {
        }
    }
}