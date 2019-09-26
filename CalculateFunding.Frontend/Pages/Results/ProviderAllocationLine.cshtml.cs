namespace CalculateFunding.Frontend.Pages.Results
{
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Policies;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Serilog;

    public class ProviderAllocationLinePageModel : ProviderResultsBasePageModel
    {
        private ILogger _logger;

        public ProviderAllocationLinePageModel(IResultsApiClient resultsApiClient, IProvidersApiClient providersApiClient, IPoliciesApiClient policiesApiClient, IMapper mapper, ISpecsApiClient specsApiClient, ILogger logger)
            : base(resultsApiClient, providersApiClient, policiesApiClient, mapper, specsApiClient, logger)
        {
            _logger = logger;
        }

        public override void PopulateResults(ApiResponse<ProviderResults> providerResponse)
        {
            //Guard.ArgumentNotNull(providerResponse, nameof(providerResponse));

            //if (providerResponse.Content == null)
            //{
            //    _logger.Error("Provider result content is null");
            //    throw new InvalidOperationException("Provider result content is null");
            //}

            //if (providerResponse.Content.AllocationResults == null)
            //{
            //    _logger.Error("Provider AllocationResults is null");
            //    throw new InvalidOperationException("Provider AllocationResults is null");
            //}

            //ViewModel.AllocationLineItems = providerResponse.Content.AllocationResults.Select(m =>
            //    new AllocationLineResult
            //    {
            //        AllocationLine = m.AllocationLine.Name,
            //        SubTotal = m.Value
            //    }
            //);
        }
    }
}