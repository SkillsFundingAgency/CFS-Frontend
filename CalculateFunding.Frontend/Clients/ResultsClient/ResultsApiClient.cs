namespace CalculateFunding.Frontend.Clients.ResultsClient
{
    using System.Collections.Generic;
    using System.Net;
    using System.Threading;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Core;
    using CalculateFunding.Frontend.Interfaces.Core.Logging;
    using Microsoft.Extensions.Options;
    using Serilog;

    public class ResultsApiClient : AbstractApiClient, IResultsApiClient
    {
        private readonly string _resultsPath;

        public ResultsApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILogger logger, ICorrelationIdProvider correlationIdProvider)
            : base(options, httpClient, logger, correlationIdProvider)
        {
            _resultsPath = options.Value.ResultsPath ?? "/api/results";
        }

        public Task<ApiResponse<BudgetSummary[]>> GetBudgetResults(CancellationToken cancellationToken = default(CancellationToken))
        {
            return GetAsync<BudgetSummary[]>($"{_resultsPath}/budgets", cancellationToken);
        }

        public Task<ApiResponse<ProviderTestResult[]>> GetProviderResults(string budgetId, CancellationToken cancellationToken = default(CancellationToken))
        {
            Guard.IsNullOrWhiteSpace(budgetId, nameof(budgetId));

            return GetAsync<ProviderTestResult[]>($"{_resultsPath}/providers?budgetId={budgetId}", cancellationToken);
        }

        public Task<ApiResponse<ProviderResults>> GetProviderResults(string providerId, string specificationId, CancellationToken cancellationToken = default(CancellationToken))
        {
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return GetAsync<ProviderResults>($"{_resultsPath}/get-provider-results?providerId={providerId}&specificationId={specificationId}", cancellationToken);
        }

        public Task<ApiResponse<ProviderTestResult>> GetProviderResult(string budgetId, string providerId, CancellationToken cancellationToken = default(CancellationToken))
        {
            Guard.IsNullOrWhiteSpace(budgetId, nameof(budgetId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            return GetAsync<ProviderTestResult>($"{_resultsPath}/providers?budgetId={budgetId}&providerId={providerId}", cancellationToken);
        }

        public Task<ApiResponse<AllocationLine>> GetAllocationLine(string budgetId, string allocationLineId, CancellationToken cancellationToken = default(CancellationToken))
        {
            Guard.IsNullOrWhiteSpace(budgetId, nameof(budgetId));
            Guard.IsNullOrWhiteSpace(allocationLineId, nameof(allocationLineId));

            return GetAsync<AllocationLine>($"{_resultsPath}/allocationLine?budgetId={budgetId}&allocationLineId={allocationLineId}", cancellationToken);
        }

        public async Task<PagedResult<ProviderSearchResultItem>> FindProviders(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<ProviderSearchResultItem>> results = await PostAsync<SearchResults<ProviderSearchResultItem>, SearchQueryRequest>($"{_resultsPath}/providers-search", request);

            if (results.StatusCode == HttpStatusCode.OK)
            {
                PagedResult<ProviderSearchResultItem> result = new SearchPagedResult<ProviderSearchResultItem>(filterOptions, results.Content.TotalCount)
                {
                    Items = results.Content.Results,
                    Facets = results.Content.Facets,
                };

                return result;
            }
            else
            {
                return null;
            }
        }

        public Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecifications(string providerId)
        {
            return GetAsync<IEnumerable<SpecificationSummary>>($"{_resultsPath}/get-provider-specs?providerId={providerId}");
        }

        public async Task<ApiResponse<Provider>> GetProviderByProviderId(string providerId)
        {
            ApiResponse<Provider> provider = await GetAsync<Provider>($"{_resultsPath}/get-provider?providerId={providerId}");

            if (provider!=null && provider.StatusCode == HttpStatusCode.OK)
            {
                if(provider.Content.UKPRN.HasValue)
                    provider.Content.Id = provider.Content.UKPRN.Value.ToString();
            }

            return provider;
        }
    }
}
