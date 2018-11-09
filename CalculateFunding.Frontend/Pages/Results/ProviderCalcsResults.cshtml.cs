namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Serilog;
    using System.Linq;

    public class ProviderCalcsResultsPageModel : ProviderResultsBasePageModel
    {
        public ProviderCalcsResultsPageModel(IResultsApiClient resultsApiClient, ISpecsApiClient specsApiClient, IMapper mapper, ILogger logger)
            : base(resultsApiClient, mapper, specsApiClient, logger)
        { }

        public override void PopulateResults(ApiResponse<ProviderResults> providerResponse)
        {
            ViewModel.CalculationItems = providerResponse.Content.CalculationResults.Select(m =>
                         new CalculationItemResult
                         {
                             Calculation = m.Calculation.Name,
                             SubTotal = m.Value,
                             CalculationType = m.CalculationType
                         }
                     );
        }

    }
}