namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Common.FeatureToggles;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Serilog;
    using System.Linq;

    public class ProviderCalcsResultsPageModel : ProviderResultsBasePageModel
    {
        private IFeatureToggle _featureToggle;

        public int CalculationErrorCount { get; set; }

        public ProviderCalcsResultsPageModel(IResultsApiClient resultsApiClient, IProvidersApiClient providersApiClient, ISpecsApiClient specsApiClient, IMapper mapper, ILogger logger, IFeatureToggle featureToggle)
            : base(resultsApiClient, providersApiClient, mapper, specsApiClient, logger)
        {
            _featureToggle = featureToggle;
        }

        public override void PopulateResults(ApiResponse<ProviderResults> providerResponse)
        {
            this.CalculationErrorCount = providerResponse.Content.CalculationResults.Where(m => !string.IsNullOrWhiteSpace(m.ExceptionType) && _featureToggle.IsExceptionMessagesEnabled()).Count();
            ViewModel.CalculationItems = providerResponse.Content.CalculationResults.Select(m =>
                         new CalculationItemResult
                         {
                             Calculation = m.Calculation.Name,
                             SubTotal = m.Value,
                             CalculationExceptionType = _featureToggle.IsExceptionMessagesEnabled() ? m.ExceptionType : string.Empty,
                             CalculationExceptionMessage = _featureToggle.IsExceptionMessagesEnabled() ? m.ExceptionMessage : string.Empty,
                             CalculationType = m.CalculationType
                         }
                     );
        }

    }
}