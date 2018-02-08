namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using CalculateFunding.Frontend.ViewModels.Common;
    using Serilog;

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
                Page = 1,
                PageSize = 50,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = request.Filters,
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

            PagedResult<CalculationSearchResultItem> calculationsResult = await _calculationsApiClient.FindCalculations(requestOptions);
            if (calculationsResult == null)
            {
                _logger.Error("Find calculations HTTP request failed");
                return null;
            }

            CalculationSearchResultViewModel result = new CalculationSearchResultViewModel();

            result.TotalResults = calculationsResult.TotalItems;
            result.CurrentPage = calculationsResult.PageNumber;
            List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();
            if (calculationsResult.Facets != null)
            {
                foreach (SearchFacet facet in calculationsResult.Facets)
                {
                    searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
                }
            }

            result.Facets = searchFacets.AsEnumerable();

            List<CalculationSearchResultItemViewModel> itemResults = new List<CalculationSearchResultItemViewModel>();

            foreach (CalculationSearchResultItem searchResult in calculationsResult.Items)
            {
                itemResults.Add(_mapper.Map<CalculationSearchResultItemViewModel>(searchResult));
            }

            result.Calculations = itemResults.AsEnumerable();
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

            if (result.EndItemNumber > calculationsResult.TotalItems)
            {
                result.EndItemNumber = calculationsResult.TotalItems;
            }

            result.PagerState = new PagerState(requestOptions.Page, calculationsResult.TotalPages, 4);

            return result;
        }
    }
}
