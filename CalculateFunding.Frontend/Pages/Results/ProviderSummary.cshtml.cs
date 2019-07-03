namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Common.FeatureToggles;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Serilog;

    public class ProviderSummaryPageModel : ProviderResultsBasePageModel
    {
        private IFeatureToggle _featureToggle;

        public ProviderSummaryPageModel(IResultsApiClient resultsApiClient, IProvidersApiClient providersApiClient, ISpecsApiClient specsApiClient, IMapper mapper, ILogger logger, IFeatureToggle featureToggle)
            : base(resultsApiClient, providersApiClient, mapper, specsApiClient, logger)
        {
            _featureToggle = featureToggle;
        }

        public override void PopulateResults(ApiResponse<ProviderResults> providerResponse)
        {
        }

    }
}