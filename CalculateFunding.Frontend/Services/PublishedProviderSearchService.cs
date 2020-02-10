using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using Serilog;

namespace CalculateFunding.Frontend.Services
{
    public class PublishedProviderSearchService : IPublishedProviderSearchService
    {
        private readonly IPublishingApiClient _publishingApiClient;
        private readonly ILogger _logger;
        private readonly IMapper _mapper;

        public PublishedProviderSearchService(IPublishingApiClient publishingApiClient, ILogger logger, IMapper mapper)
        {
            _publishingApiClient = publishingApiClient;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<PublishProviderSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            SearchModel requestOptions = new SearchModel
            {
                PageNumber = request.PageNumber ?? 1,
                Top = request.PageSize.Value,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = request.Filters,
                SearchMode = Common.Models.Search.SearchMode.All
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.PageNumber = request.PageNumber.Value;
            }

            ApiResponse<SearchResults<PublishedProviderSearchItem>> searchRequestResult = await _publishingApiClient.SearchPublishedProvider(requestOptions);

            if (searchRequestResult == null)
            {
                _logger.Error("Find providers HTTP request failed");
                return null;
            }

            PublishProviderSearchResultViewModel result = new PublishProviderSearchResultViewModel
            {
                TotalResults = searchRequestResult.Content?.TotalCount ?? 0,
                CurrentPage = requestOptions.PageNumber,
            };

            List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();

            if (searchRequestResult.Content?.Facets != null)
            {
                foreach (SearchFacet facet in searchRequestResult.Content.Facets)
                {
                    searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
                }
            }

            result.Facets = searchFacets.AsEnumerable();

            List<PublishedProviderSearchResultItemViewModel> itemResults = new List<PublishedProviderSearchResultItemViewModel>();

            result.FilteredFundingAmount = 0;

            if (searchRequestResult.Content != null)
            {
                foreach (PublishedProviderSearchItem searchResult in searchRequestResult.Content.Results)
                {
                    itemResults.Add(_mapper.Map<PublishedProviderSearchResultItemViewModel>(searchResult));
                    result.FilteredFundingAmount += searchResult.FundingValue;
                }

                result.Providers = itemResults.AsEnumerable();
                if (result.TotalResults == 0)
                {
                    result.StartItemNumber = 0;
                    result.EndItemNumber = 0;
                }
                else
                {
                    result.StartItemNumber = ((requestOptions.PageNumber - 1) * requestOptions.Top) + 1;
                    result.EndItemNumber = result.StartItemNumber + requestOptions.Top - 1;
                }

                if (result.EndItemNumber > searchRequestResult.Content.TotalCount)
                {
                    result.EndItemNumber = searchRequestResult.Content.TotalCount;
                }
            }

            result.CanPublish = result.CanApprove = false;

            result.TotalFundingAmount = 0;
            result.TotalProvidersToApprove = 0;
            result.TotalProvidersToPublish = 0;

            int totalItemCount = result.TotalResults;
            int totalPages = (int)Math.Ceiling((double)totalItemCount / (double)request.PageSize.Value);
            result.PagerState = new PagerState(requestOptions.PageNumber, totalPages, 4);

            if (result.Providers.FirstOrDefault() == null)
            {
                return result;
            }

            ApiResponse<IEnumerable<ProviderFundingStreamStatusResponse>> providerStatusCounts =
                await _publishingApiClient.GetProviderStatusCounts(
                    result.Providers.First().SpecificationId,
                    request.Filters.GetValueOrDefault("providerType")?.FirstOrDefault(),
                    request.Filters.GetValueOrDefault("localAuthority")?.FirstOrDefault(),
                    request.Filters.GetValueOrDefault("fundingStatus")?.FirstOrDefault()
                    );

            foreach (var providerFundingStreamStatusResponse in providerStatusCounts.Content)
            {
                if (providerFundingStreamStatusResponse.ProviderDraftCount == 0 &&
                    providerFundingStreamStatusResponse.ProviderApprovedCount > 0 &&
                    providerFundingStreamStatusResponse.ProviderUpdatedCount == 0)
                {
                    result.CanPublish = true;
                    result.TotalProvidersToPublish += providerFundingStreamStatusResponse.ProviderApprovedCount;
                }

                if (providerFundingStreamStatusResponse.ProviderDraftCount > 0 ||
                    providerFundingStreamStatusResponse.ProviderUpdatedCount > 0)
                {
                    result.CanApprove = true;
                    result.TotalProvidersToApprove += providerFundingStreamStatusResponse.ProviderUpdatedCount;
                    result.TotalProvidersToApprove += providerFundingStreamStatusResponse.ProviderDraftCount;
                }

                if (providerFundingStreamStatusResponse.TotalFunding.HasValue)
                {
                    result.TotalFundingAmount = +providerFundingStreamStatusResponse.TotalFunding.Value;
                }
            }

            return result;
        }

    }
}
