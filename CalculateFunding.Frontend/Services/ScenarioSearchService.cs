namespace CalculateFunding.Frontend.Services
{
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Scenarios;
    using Serilog;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

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
                Page = 1,
                PageSize = PageSize,
                SearchTerm = request.SearchTerm,
                IncludeFacets = true,
                Filters = request.Filters,
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

              PagedResult<ScenarioSearchResultItem> ScenariosResult = await _scenariosApiClient.FindScenarios(requestOptions);

            //PagedResult<ScenarioSearchResultItem> ScenariosResult = await _scenariosApiClient.GetScenarioResults(request);
            if (ScenariosResult == null)
            {
                _logger.Error("Find Scenarios HTTP request failed");
                return null;
            }

            ScenarioSearchResultViewModel results = new ScenarioSearchResultViewModel
            {
                TotalResults = ScenariosResult.TotalItems,
                CurrentPage = ScenariosResult.PageNumber
            };

            IList<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();
      
            if (ScenariosResult.Facets != null)
            {
                foreach (SearchFacet facet in ScenariosResult.Facets)
                {
                    searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
                }
            }

            results.Facets = searchFacets.AsEnumerable();

            List<ScenarioSearchResultItemViewModel> itemResults = new List<ScenarioSearchResultItemViewModel>();

            foreach(ScenarioSearchResultItem searchResult in ScenariosResult.Items)
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

            if (results.EndItemNumber > ScenariosResult.TotalItems)
            {
                results.EndItemNumber = ScenariosResult.TotalItems;
            }

            results.PagerState = new PagerState(requestOptions.Page, ScenariosResult.TotalPages, 4);

            return results;
        }



    }
}
