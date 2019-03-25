namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;
    using Serilog;
    using CalculateFunding.Common.FeatureToggles;

    public class SpecificationSearchService : ISpecificationSearchService
    {
        private ISpecsApiClient _specsApiClient;
        private IMapper _mapper;
        private ILogger _logger;
        private readonly IFeatureToggle _featureToggle;

        public SpecificationSearchService(ISpecsApiClient specsApiClient, IMapper mapper, ILogger logger, IFeatureToggle featureToggle)
        {
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(featureToggle, nameof(featureToggle));


            _specsApiClient = specsApiClient;
            _mapper = mapper;
            _logger = logger;
            _featureToggle = featureToggle;
        }

        public async Task<SpecificationSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            SearchFilterRequest requestOptions = new SearchFilterRequest()
            {
                Page = request.PageNumber.HasValue ? request.PageNumber.Value : 1,
                PageSize = request.PageSize.HasValue ? request.PageSize.Value : 50,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = request.Filters,
                SearchMode = _featureToggle.IsSearchModeAllEnabled() ? SearchMode.All : SearchMode.Any
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
