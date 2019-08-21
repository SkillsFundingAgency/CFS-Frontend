using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.FeatureToggles;
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
        private readonly IFeatureToggle _featureToggle;

        public CalculationSearchService(ICalculationsApiClient calculationsClient, IMapper mapper, ILogger logger, IFeatureToggle featureToggle)
        {
            Guard.ArgumentNotNull(calculationsClient, nameof(calculationsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(featureToggle, nameof(featureToggle));

            _calculationsApiClient = calculationsClient;
            _mapper = mapper;
            _logger = logger;
            _featureToggle = featureToggle;
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
                SearchMode = _featureToggle.IsSearchModeAllEnabled() ? SearchMode.All : SearchMode.Any
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
                TotalResults = calculationsResult.Content.TotalCount
            };

            List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();
            if (calculationsResult.Content.Facets != null)
            {
                searchFacets.AddRange(calculationsResult.Content.Facets.Select(facet => _mapper.Map<SearchFacetViewModel>(facet)));
            }

            result.Facets = searchFacets.AsEnumerable();

            List<CalculationSearchResultItemViewModel> itemResults = new List<CalculationSearchResultItemViewModel>();

            foreach (CalculationSearchResult searchResult in calculationsResult.Content.Results)
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

            if (result.EndItemNumber > calculationsResult.Content.TotalCount)
            {
                result.EndItemNumber = calculationsResult.Content.TotalCount;
            }

            int totalPages = 0;
            if (calculationsResult.Content.TotalCount > 0)
            {
                totalPages = requestOptions.PageSize % calculationsResult.Content.TotalCount;
            }

            result.PagerState = new PagerState(requestOptions.Page, totalPages, 4);

            return result;
        }
    }
}
