namespace CalculateFunding.Frontend.Clients.ResultsClient
{
    using System.Collections.Generic;
    using System.Net;
    using System.Net.Http;
    using System.Threading;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models.Results;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Http;
    using Serilog;

    public class ResultsApiClient : BaseApiClient, IResultsApiClient
    {

        public ResultsApiClient(IHttpClientFactory httpClientFactory, ILogger logger, IHttpContextAccessor contextAccessor)
            : base(httpClientFactory, HttpClientKeys.Results, logger, contextAccessor)
        {
        }

        public async Task<ApiResponse<ProviderResults>> GetProviderResults(string providerId, string specificationId, CancellationToken cancellationToken = default(CancellationToken))
        {
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            return await GetAsync<ProviderResults>($"get-provider-results?providerId={providerId}&specificationId={specificationId}", cancellationToken);
        }

        public async Task<PagedResult<ProviderSearchResultItem>> FindProviders(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<ProviderSearchResultItem>> results = await PostAsync<SearchResults<ProviderSearchResultItem>, SearchQueryRequest>($"providers-search", request);

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

        public async Task<ApiResponse<IEnumerable<string>>> GetSpecificationIdsForProvider(string providerId)
        {
            return await GetAsync<IEnumerable<string>>($"get-provider-specs?providerId={providerId}");
        }

        public async Task<ApiResponse<Provider>> GetProviderByProviderId(string providerId)
        {
            ApiResponse<Provider> provider = await GetAsync<Provider>($"get-provider?providerId={providerId}");

            if (provider != null && provider.StatusCode == HttpStatusCode.OK)
            {
                if (provider.Content.UKPRN.HasValue)
                {
                    provider.Content.Id = provider.Content.UKPRN.Value.ToString();
                }
            }

            return provider;
        }

        public async Task<PagedResult<CalculationProviderResultSearchResultItem>> FindCalculationProviderResults(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<CalculationProviderResultSearchResultItem>> results = await PostAsync<SearchResults<CalculationProviderResultSearchResultItem>, SearchQueryRequest>($"calculation-provider-results-search", request);

            if (results.StatusCode == HttpStatusCode.OK)
            {
                PagedResult<CalculationProviderResultSearchResultItem> result = new SearchPagedResult<CalculationProviderResultSearchResultItem>(filterOptions, results.Content.TotalCount)
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

        public async Task<ApiResponse<IEnumerable<FundingCalculationResultsTotals>>> GetFundingCalculationResultsTotals(SpecificationIdsRequestModel specificationIds)
        {
            Guard.ArgumentNotNull(specificationIds, nameof(specificationIds));

            return await PostAsync<IEnumerable<FundingCalculationResultsTotals>, SpecificationIdsRequestModel>($"get-calculation-result-totals-for-specifications", specificationIds);
        }

        public async Task<ApiResponse<IEnumerable<PublishedProviderResult>>> GetPublishedProviderResults(string specificationId)
        {
            return await GetAsync<IEnumerable<PublishedProviderResult>>($"get-published-provider-results-for-specification?specificationId={specificationId}");
        }

        public async Task<ApiResponse<IEnumerable<PublishedProviderResult>>> GetPublishedProviderResults(string periodId, string specificationId, string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(periodId, nameof(periodId));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            return await GetAsync<IEnumerable<PublishedProviderResult>>($"get-published-provider-results-for-funding-stream?fundingPeriodId={periodId}&specificationId={specificationId}&fundingStreamId={fundingStreamId}");
        }

        public async Task<ValidatedApiResponse<ConfirmPublishApprove>> GetProviderResultsForPublishOrApproval(string specificationId, PublishedAllocationLineResultStatusUpdateModel filterCriteria)
        {
            return await ValidatedPostAsync<ConfirmPublishApprove, PublishedAllocationLineResultStatusUpdateModel>($"get-confirmation-details-for-approve-publish-provider-results?specificationId={specificationId}", filterCriteria);
        }

        public async Task<ValidatedApiResponse<PublishedAllocationLineResultStatusUpdateResponseModel>> UpdatePublishedAllocationLineStatus(string specificationId, PublishedAllocationLineResultStatusUpdateModel updateModel)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(updateModel, nameof(updateModel));

            return await ValidatedPostAsync<PublishedAllocationLineResultStatusUpdateResponseModel, PublishedAllocationLineResultStatusUpdateModel>($"update-published-allocationline-results-status?specificationId={specificationId}", updateModel);
        }
    }
}
