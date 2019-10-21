using System;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.Models.Search;

namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
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
	        int pageNumber = request.PageNumber.GetValueOrDefault(1);
	        int pageSize = request.PageSize.GetValueOrDefault(50);
	        
	        ApiResponse<CalculationProviderResultSearchResults> searchRequestResult = await _resultsClient.SearchCalculationProviderResults(new SearchModel
            {
	            PageNumber = pageNumber,
	            Top = pageSize,
	            SearchTerm = request.SearchTerm,
	            IncludeFacets = request.IncludeFacets,
	            ErrorToggle = string.IsNullOrWhiteSpace(request.ErrorToggle) ? (bool?)null : (request.ErrorToggle == "Errors" ? true : false),
	            Filters = request.Filters
            });

            if (searchRequestResult == null)
            {
                _logger.Error("Find providers HTTP request failed");
                return null;
            }

            CalculationProviderResultSearchResults calculationProviderResultSearchResults = searchRequestResult.Content;
            
            CalculationProviderResultSearchResultViewModel result = new CalculationProviderResultSearchResultViewModel
            {
                TotalResults = calculationProviderResultSearchResults.TotalCount,
                CurrentPage = pageNumber,
                TotalErrorResults = calculationProviderResultSearchResults.TotalErrorCount
            };

            List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();

            if (calculationProviderResultSearchResults.Facets != null)
            {
                foreach (Facet facet in calculationProviderResultSearchResults.Facets)
                {
                    searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
                }
            }

            result.Facets = searchFacets.AsEnumerable();

            List<CalculationProviderResultSearchResultItemViewModel> itemResults = new List<CalculationProviderResultSearchResultItemViewModel>();

            foreach (CalculationProviderResultSearchResult searchresult in calculationProviderResultSearchResults.Results)
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
                result.StartItemNumber = ((pageNumber - 1) * pageSize) + 1;
                result.EndItemNumber = result.StartItemNumber + pageSize - 1;
            }

            if (result.EndItemNumber > calculationProviderResultSearchResults.TotalCount)
            {
                result.EndItemNumber = calculationProviderResultSearchResults.TotalCount;
            }

            result.PagerState = new PagerState(pageNumber, (int) Math.Ceiling(calculationProviderResultSearchResults.TotalCount/(double)pageSize), 4);

            return result;
        }
    }
}
