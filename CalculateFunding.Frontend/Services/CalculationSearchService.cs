using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;
using Serilog;

namespace CalculateFunding.Frontend.Services
{
    public class CalculationSearchService : ICalculationSearchService
    {
        private ICalculationsApiClient _calculationsApiClient;
        private IMapper _mapper;
        private ILogger _logger;

        public CalculationSearchService(ICalculationsApiClient calculationsClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(calculationsClient, nameof(calculationsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _calculationsApiClient = calculationsClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<CalculationSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            SearchFilterRequest requestOptions = new SearchFilterRequest()
            {
                Page = request.PageNumber.HasValue ? request.PageNumber.Value : 1,
                PageSize = request.PageSize.HasValue ? request.PageSize.Value : 50,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = request.Filters,
                FacetCount = request.FacetCount,
                SearchMode = SearchMode.All
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

            ApiResponse<SearchResults<CalculationSearchResult>> calculationsResult = await _calculationsApiClient.FindCalculations(requestOptions);

            if (calculationsResult == null)
            {
                _logger.Error("Find calculations HTTP request failed");
                return null;
            }

            CalculationSearchResultViewModel result = new CalculationSearchResultViewModel
            {
                TotalResults = calculationsResult.Content?.TotalCount ?? 0,
                CurrentPage = requestOptions.Page,
                Calculations = calculationsResult.Content?.Results?.Select(m => _mapper.Map<CalculationSearchResultItemViewModel>(m))
            };

            List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();
            if (calculationsResult.Content != null && calculationsResult.Content.Facets != null)
            {
                searchFacets.AddRange(calculationsResult.Content.Facets.Select(facet => _mapper.Map<SearchFacetViewModel>(facet)));
            }

            result.Facets = searchFacets.AsEnumerable();

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

            if (result.EndItemNumber > result.TotalResults)
            {
                result.EndItemNumber = result.TotalResults;
            }

            int totalPages = 0;
            if (result.TotalResults > 0)
            {
                totalPages = requestOptions.PageSize % result.TotalResults;
            }

            result.PagerState = new PagerState(requestOptions.Page, totalPages, 4);

            return result;
        }
    }
}
