using CalculateFunding.Common.ApiClient.Results;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Specifications;
using Serilog;

namespace CalculateFunding.Frontend.Pages.Results
{
    public class ProviderSummaryPageModel : ProviderResultsBasePageModel
    {
	    public ProviderSummaryPageModel(IResultsApiClient resultsApiClient, IProvidersApiClient providersApiClient, IPoliciesApiClient policiesApiClient, ISpecificationsApiClient specsApiClient, IMapper mapper, ILogger logger)
            : base(resultsApiClient, providersApiClient, policiesApiClient, mapper, specsApiClient, logger)
        {
        }
    }
}