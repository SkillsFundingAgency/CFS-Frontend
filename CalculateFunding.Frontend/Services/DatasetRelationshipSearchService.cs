using System.Collections.Concurrent;

namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using Common.Utility;
    using Common.ApiClient.Models;
    using Common.ApiClient.Specifications;
    using Common.ApiClient.Specifications.Models;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using ViewModels.Specs;
    using Serilog;

    public class DatasetRelationshipsSearchService : IDatasetRelationshipsSearchService
    {
        private const int PageSize = 20;

        private readonly ISpecificationsApiClient _specsClient;
        private readonly ILogger _logger;
        private IMapper _mapper;

        public DatasetRelationshipsSearchService(ISpecificationsApiClient specsClient, ILogger logger, IMapper mapper)
        {
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(logger, nameof(logger));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _specsClient = specsClient;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<SpecificationDatasourceRelationshipSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            IDictionary<string, string[]> filters = request.Filters.IsNullOrEmpty()
                ? new ConcurrentDictionary<string, string[]>()
                : request.Filters;
            if (filters.ContainsKey(""))
            {
                filters.Remove("");
            }

            SearchFilterRequest requestOptions = new SearchFilterRequest
            {
                Page = request.PageNumber.HasValue ? request.PageNumber.Value : 1,
                PageSize = request.PageSize.HasValue ? request.PageSize.Value : 50,
                SearchTerm = request.SearchTerm,
                IncludeFacets = request.IncludeFacets,
                Filters = filters
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

            PagedResult<SpecificationDatasourceRelationshipSearchResultItem> pagedResult =
                await _specsClient.FindSpecificationAndRelationships(requestOptions);

            if (pagedResult == null)
            {
                _logger.Error("Find specification data source relationships HTTP request failed");
            }

            int startNumber = pagedResult.PageSize * pagedResult.PageNumber - pagedResult.PageSize + 1;
            int endNumber = pagedResult.PageSize * pagedResult.PageNumber;
            if (endNumber > pagedResult.TotalItems)
            {
                endNumber = pagedResult.TotalItems;
            }

            List<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();
            if (pagedResult.Facets != null)
            {
                foreach (SearchFacet facet in pagedResult.Facets)
                {
                    searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
                }
            }

            SpecificationDatasourceRelationshipSearchResultViewModel viewModel =
                new SpecificationDatasourceRelationshipSearchResultViewModel
                {
                    Items = pagedResult.Items,
                    PagerState = new PagerState(pagedResult.PageNumber, pagedResult.TotalPages),
                    TotalCount = pagedResult.TotalItems,
                    StartItemNumber = startNumber,
                    EndItemNumber = endNumber,
                    Facets = searchFacets.AsEnumerable()
                };

            return viewModel;
        }
    }
}