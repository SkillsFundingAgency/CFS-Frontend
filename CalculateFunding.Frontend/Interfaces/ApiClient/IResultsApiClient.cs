namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;

    public interface IResultsApiClient
    {
        Task<ApiResponse<AllocationLine>> GetAllocationLine(string budgetId, string allocationLineId, CancellationToken cancellationToken = default(CancellationToken));

        Task<ApiResponse<BudgetSummary[]>> GetBudgetResults(CancellationToken cancellationToken = default(CancellationToken));

        Task<ApiResponse<ProviderTestResult>> GetProviderResult(string budgetId, string providerId, CancellationToken cancellationToken = default(CancellationToken));

        Task<ApiResponse<ProviderTestResult[]>> GetProviderResults(string budgetId, CancellationToken cancellationToken = default(CancellationToken));

        /// <summary>
        /// Gets a paged list of providers, given the paged query options and search options
        /// </summary>
        /// <param name="filterOptions">Filter Options</param>
        /// <returns>List of Providers</returns>
        Task<PagedResult<ProviderSearchResultItem>> FindProviders(SearchFilterRequest filterOptions);

        Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecifications(string providerId);

        Task<ApiResponse<ProviderResults>> GetProviderResults(string providerId, string specificationId, CancellationToken cancellationToken = default(CancellationToken));

        Task<ApiResponse<Provider>> GetProviderByProviderId(string providerId);
    }
}