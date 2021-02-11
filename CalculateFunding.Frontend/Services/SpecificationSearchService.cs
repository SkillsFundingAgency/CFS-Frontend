namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using Common.Utility;
    using Common.ApiClient.Models;
    using Common.ApiClient.Specifications;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using ViewModels.Specs;
    using Serilog;
    using Common.ApiClient.Specifications.Models;

    public class SpecificationSearchService : ISpecificationSearchService
    {
        private ISpecificationsApiClient _specsApiClient;
        private IMapper _mapper;
        private ILogger _logger;

        public SpecificationSearchService(ISpecificationsApiClient specsApiClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _specsApiClient = specsApiClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<SpecificationSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            SearchFilterRequest requestOptions = new SearchFilterRequest()
            {
                Page = request.PageNumber.HasValue ? request.PageNumber.Value : 1,
                PageSize = request.PageSize.HasValue ? request.PageSize.Value : 50,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = request.Filters,
                SearchMode = SearchMode.All
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

            PagedResult<SpecificationSearchResultItem> calculationsResult = await _specsApiClient.FindSpecifications(requestOptions);
            if (calculationsResult == null)
            {
                _logger.Error("Find calculations HTTP request failed");
                return null;
            }

            SpecificationSearchResultViewModel result = new SpecificationSearchResultViewModel
            {
                TotalResults = calculationsResult.TotalItems,
                CurrentPage = calculationsResult.PageNumber
            };

            List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();
            if (calculationsResult.Facets != null)
            {
                foreach (SearchFacet facet in calculationsResult.Facets)
                {
                    searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
                }
            }

            result.Facets = searchFacets.AsEnumerable();

            List<SpecificationSearchResultItemViewModel> itemResults = new List<SpecificationSearchResultItemViewModel>();

            foreach (SpecificationSearchResultItem searchResult in calculationsResult.Items)
            {
                itemResults.Add(_mapper.Map<SpecificationSearchResultItemViewModel>(searchResult));
            }

            result.Specifications = itemResults.AsEnumerable();
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
