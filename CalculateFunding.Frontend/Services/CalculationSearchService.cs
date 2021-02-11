using System;
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
        private readonly ICalculationsApiClient _calculationsApiClient;
        private readonly IMapper _mapper;
        private readonly ILogger _logger;

        public CalculationSearchService(ICalculationsApiClient calculationsClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(calculationsClient, nameof(calculationsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _calculationsApiClient = calculationsClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<CalculationSearchResultViewModel> PerformSearch(string specificationId,
            CalculationType calculationType,
            PublishStatus? status,
            string searchTerm,
            int? page)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(calculationType, nameof(calculationType));

            ApiResponse<SearchResults<CalculationSearchResult>> calculationsResult =
                await _calculationsApiClient.SearchCalculationsForSpecification(specificationId,
                    calculationType,
                    status,
                    searchTerm,
                    page);

            return BuildResults(calculationsResult, page.GetValueOrDefault(1), 50);
        }

        public async Task<CalculationSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

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

            ApiResponse<SearchResults<CalculationSearchResult>> calculationsResult =
                await _calculationsApiClient.FindCalculations(requestOptions);

            return BuildResults(calculationsResult, requestOptions.Page, requestOptions.PageSize);
        }

        private CalculationSearchResultViewModel BuildResults(
            ApiResponse<SearchResults<CalculationSearchResult>> calculationsResultResponse, int page, int pageSize)
        {
            if (calculationsResultResponse?.Content == null)
            {
                _logger.Error("Find calculations HTTP request failed");
                return null;
            }

            SearchResults<CalculationSearchResult> calculationsResult = calculationsResultResponse.Content;

            CalculationSearchResultViewModel result = new CalculationSearchResultViewModel
            {
                TotalResults = calculationsResult.TotalCount,
                CurrentPage = page,
                Calculations = calculationsResult.Results?.Select(m =>
                    _mapper.Map<CalculationSearchResultItemViewModel>(m))
            };

            List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();
            if (calculationsResult.Facets != null)
            {
                searchFacets.AddRange(calculationsResultResponse.Content.Facets.Select(facet =>
                    _mapper.Map<SearchFacetViewModel>(facet)));
            }

            result.Facets = searchFacets.AsEnumerable();

            if (result.TotalResults == 0)
            {
                result.StartItemNumber = 0;
                result.EndItemNumber = 0;
            }
            else
            {
                result.StartItemNumber = ((page - 1) * pageSize) + 1;
                result.EndItemNumber = result.StartItemNumber + pageSize - 1;
            }

            if (result.EndItemNumber > result.TotalResults)
            {
                result.EndItemNumber = result.TotalResults;
            }

            result.PagerState =
                new PagerState(page, (int) Math.Ceiling(result.TotalResults / (double) pageSize), 2);

            return result;
        }
    }
}
