namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Common.ApiClient.Models;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Scenarios;
    using Serilog;

    public class ScenarioSearchService : IScenarioSearchService
    {
        private const int PageSize = 50;
        private IScenariosApiClient _scenariosApiClient;
        private IMapper _mapper;
        private ILogger _logger;

        public ScenarioSearchService(IScenariosApiClient scenariosClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(scenariosClient, nameof(scenariosClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _scenariosApiClient = scenariosClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<ScenarioSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            SearchFilterRequest requestOptions = new SearchFilterRequest()
            {
                Page = request.PageNumber.HasValue ? request.PageNumber.Value : 1,
                PageSize = request.PageSize.HasValue && request.PageSize > 0 ? request.PageSize.Value : PageSize,
                SearchTerm = request.SearchTerm,
                IncludeFacets = true,
                Filters = request.Filters,
                SearchMode = SearchMode.All
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

            PagedResult<ScenarioSearchResultItem> scenariosResult = await _scenariosApiClient.FindScenarios(requestOptions);
            if (scenariosResult == null)
            {
                _logger.Error("Find Scenarios HTTP request failed");
                return null;
            }

            ScenarioSearchResultViewModel results = new ScenarioSearchResultViewModel
            {
                TotalResults = scenariosResult.TotalItems,
                CurrentPage = scenariosResult.PageNumber
            };

            IList<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();

            if (scenariosResult.Facets != null)
            {
                foreach (SearchFacet facet in scenariosResult.Facets)
                {
                    searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
                }
            }

            results.Facets = searchFacets.AsEnumerable();

            List<ScenarioSearchResultItemViewModel> itemResults = new List<ScenarioSearchResultItemViewModel>();

            foreach (ScenarioSearchResultItem searchResult in scenariosResult.Items)
            {
                itemResults.Add(_mapper.Map<ScenarioSearchResultItemViewModel>(searchResult));

            }

            itemResults.OrderBy(f => f.LastUpdatedDate);

            results.Scenarios = itemResults.AsEnumerable();

            if (results.TotalResults == 0)
            {
                results.StartItemNumber = 0;
                results.EndItemNumber = 0;
            }
            else
            {
                results.StartItemNumber = ((requestOptions.Page - 1) * requestOptions.PageSize) + 1;
                results.EndItemNumber = results.StartItemNumber + requestOptions.PageSize - 1;
            }

            if (results.EndItemNumber > scenariosResult.TotalItems)
            {
                results.EndItemNumber = scenariosResult.TotalItems;
            }

            results.PagerState = new PagerState(requestOptions.Page, scenariosResult.TotalPages, 4);

            return results;
        }
    }
}
