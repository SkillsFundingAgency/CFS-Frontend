using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Publishing.Models;
using CalculateFunding.Common.Models.Search;
using CalculateFunding.Common.Utility;
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
            Guard.ArgumentNotNull(request.PageSize, "PageSize");
            
            SearchModel requestOptions = new SearchModel
            {
                PageNumber = request.PageNumber ?? 1,
                Top = request.PageSize.Value,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = request.Filters,
                SearchMode = Common.Models.Search.SearchMode.All,
                SearchFields = request.SearchFields
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
                TotalErrorResults = searchRequestResult.Content?.TotalErrorCount ?? 0,
                CurrentPage = requestOptions.PageNumber,
                Facets = searchRequestResult.Content?.Facets?.Select(facet => _mapper.Map<SearchFacetViewModel>(facet)),
                Providers = searchRequestResult.Content?.Results?.Select(provider => _mapper.Map<PublishedProviderSearchResultItemViewModel>(provider)),
                FilteredFundingAmount = searchRequestResult.Content?.Results?.Sum(x => x.FundingValue) ?? 0
            };

            int totalPages = (int) Math.Ceiling((double) result.TotalResults / (double) request.PageSize.Value);
            result.PagerState = new PagerState(requestOptions.PageNumber, totalPages, 4);
            
            int numberOfResultsInThisPage = result.Providers?.Count() ?? 0;
            if (numberOfResultsInThisPage > 0)
            {
                result.StartItemNumber = (result.PagerState.CurrentPage - 1) * request.PageSize.Value + 1;
                result.EndItemNumber = result.StartItemNumber + numberOfResultsInThisPage - 1;
            }

            if (result.Providers != null && result.Providers.Any())
            {
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
            }

            return result;
        }
    }
}