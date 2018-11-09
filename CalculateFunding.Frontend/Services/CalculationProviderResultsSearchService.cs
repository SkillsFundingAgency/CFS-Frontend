namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;
    using Serilog;

    public class CalculationProviderResultsSearchService : ICalculationProviderResultsSearchService
    {
        private IResultsApiClient _resultsClient;
        private IMapper _mapper;
        private ILogger _logger;

        public CalculationProviderResultsSearchService(IResultsApiClient resultsApiClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _resultsClient = resultsApiClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<CalculationProviderResultSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            SearchFilterRequest requestOptions = new SearchFilterRequest()
            {
                Page = request.PageNumber.HasValue ? request.PageNumber.Value : 1,
                PageSize = request.PageSize.HasValue ? request.PageSize.Value : 50,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = request.Filters,
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

            PagedResult<CalculationProviderResultSearchResultItem> searchRequestResult = await _resultsClient.FindCalculationProviderResults(requestOptions);

            if (searchRequestResult == null)
            {
                _logger.Error("Find providers HTTP request failed");
                return null;
            }

            CalculationProviderResultSearchResultViewModel result = new CalculationProviderResultSearchResultViewModel
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

            List<CalculationProviderResultSearchResultItemViewModel> itemResults = new List<CalculationProviderResultSearchResultItemViewModel>();

            foreach (CalculationProviderResultSearchResultItem searchresult in searchRequestResult.Items)
            {
                itemResults.Add(_mapper.Map<CalculationProviderResultSearchResultItemViewModel>(searchresult));
            }

            result.CalculationProviderResults = itemResults.AsEnumerable();

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
