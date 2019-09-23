namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Common.ApiClient.Providers;
    using CalculateFunding.Common.ApiClient.Providers.Models;
    using CalculateFunding.Common.ApiClient.Providers.Models.Search;
    using CalculateFunding.Common.FeatureToggles;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Serilog;

    public class ProviderSearchService : IProviderSearchService
    {
        private IProvidersApiClient _providersApiClient;
        private IMapper _mapper;
        private ILogger _logger;
        private readonly IFeatureToggle _featureToggle;

        public ProviderSearchService(IProvidersApiClient providersApiClient, IMapper mapper, ILogger logger, IFeatureToggle featureToggle)
        {
            Guard.ArgumentNotNull(providersApiClient, nameof(providersApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(featureToggle, nameof(featureToggle));

            _providersApiClient = providersApiClient;
            _mapper = mapper;
            _logger = logger;
            _featureToggle = featureToggle;
        }

        public async Task<IEnumerable<ProviderVersionMetadata>> GetProviderVersionsByFundingStream(string fundingStreamId)
        {
            ApiResponse<IEnumerable<ProviderVersionMetadata>> providerVersionsResponse = await _providersApiClient.GetProviderVersionsByFundingStream(fundingStreamId);

            if (providerVersionsResponse?.Content == null)
            {
                _logger.Error("Get provider verions by funding stream HTTP request failed");
                return null;
            }

            return providerVersionsResponse.Content;
        }


        public async Task<ProviderSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            SearchFilterRequest requestOptions = new SearchFilterRequest()
            {
                Page = 1,
                PageSize = 50,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = request.Filters,
                SearchMode = _featureToggle.IsSearchModeAllEnabled() ? SearchMode.All : SearchMode.Any
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

            PagedResult<ProviderVersionSearchResult> searchRequestResult = await _providersApiClient.SearchMasterProviders(requestOptions);

            if (searchRequestResult == null)
            {
                _logger.Error("Find providers HTTP request failed");
                return null;
            }

            ProviderSearchResultViewModel result = new ProviderSearchResultViewModel
            {
                TotalResults = searchRequestResult.TotalItems,
                CurrentPage = searchRequestResult.PageNumber,
            };

            List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();

            if (searchRequestResult.Facets != null)
            {
                foreach (SearchFacet facet in searchRequestResult.Facets)
                {
                    searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
                }
            }

            result.Facets = searchFacets.AsEnumerable();

            List<ProviderSearchResultItemViewModel> itemResults = new List<ProviderSearchResultItemViewModel>();

            foreach (ProviderVersionSearchResult searchresult in searchRequestResult.Items)
            {
                itemResults.Add(_mapper.Map<ProviderSearchResultItemViewModel>(searchresult));
            }

            result.Providers = itemResults.AsEnumerable();
            if (result.TotalResults == 0)
            {
                result.StartItemNumber = 0;
                result.EndItemNumber = 0;
            }
            else
            {
                result.StartItemNumber = ((requestOptions.Page - 1) * requestOptions.PageSize) + 1;
                result.EndItemNumber = result.StartItemNumber + requestOptions.PageSize - 1;
            }

            if (result.EndItemNumber > searchRequestResult.TotalItems)
            {
                result.EndItemNumber = searchRequestResult.TotalItems;
            }

            result.PagerState = new PagerState(requestOptions.Page, searchRequestResult.TotalPages, 4);

            return result;
        }
    }
}
