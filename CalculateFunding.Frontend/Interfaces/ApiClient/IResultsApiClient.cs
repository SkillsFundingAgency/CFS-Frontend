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
        /// <summary>
        /// Gets a paged list of providers, given the paged query options and search options
        /// </summary>
        /// <param name="filterOptions">Filter Options</param>
        /// <returns>List of Providers</returns>
        Task<PagedResult<ProviderSearchResultItem>> FindProviders(SearchFilterRequest filterOptions);

        /// <summary>
        /// Returns specification IDs with results for given provider
        /// </summary>
        /// <param name="providerId">Provider ID</param>
        /// <returns></returns>
        Task<ApiResponse<IEnumerable<string>>> GetSpecificationIdsForProvider(string providerId);

        Task<ApiResponse<ProviderResults>> GetProviderResults(string providerId, string specificationId, CancellationToken cancellationToken = default(CancellationToken));

        Task<ApiResponse<Provider>> GetProviderByProviderId(string providerId);

        Task<PagedResult<CalculationProviderResultSearchResultItem>> FindCalculationProviderResults(SearchFilterRequest filterOptions);

        Task<ApiResponse<IEnumerable<FundingCalculationResultsTotals>>> GetFundingCalculationResultsTotals(SpecificationIdsRequestModel specificationIds);

        Task<ApiResponse<IEnumerable<PublishedProviderResult>>> GetPublishedProviderResults(string specificationId);
    }
}