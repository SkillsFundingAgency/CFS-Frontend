using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.TestEngine;
using Serilog;

namespace CalculateFunding.Frontend.Services
{
    public class TestResultsSearchService : ITestResultsSearchService
    {
        private ITestEngineApiClient _testsApiClient;
        private IMapper _mapper;
        private ILogger _logger;

        const int PageSize = 50;

        public TestResultsSearchService(ITestEngineApiClient testsApiClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(testsApiClient, nameof(testsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _testsApiClient = testsApiClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<ProviderTestsSearchResultViewModel> PerformProviderTestResultsSearch(SearchRequestViewModel request)
        {
            SearchFilterRequest requestOptions = new SearchFilterRequest()
            {
                Page = request.PageNumber.HasValue ? request.PageNumber.Value : 1,
                PageSize = request.PageSize.HasValue ? request.PageSize.Value : 50,
                SearchTerm = request.SearchTerm,
                IncludeFacets = true,
                Filters = request.Filters,
                SearchFields = new[] { "providerName" }
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

            PagedResult<ProviderTestSearchResultItem> ScenariosResult = await _testsApiClient.FindTestResults(requestOptions);

            if (ScenariosResult == null)
            {
                _logger.Error("Find test results HTTP request failed");
                return null;
            }

            ProviderTestsSearchResultViewModel results = new ProviderTestsSearchResultViewModel
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

            List<ProviderTestSearchResultItemViewModel> itemResults = new List<ProviderTestSearchResultItemViewModel>();

            foreach (ProviderTestSearchResultItem searchResult in ScenariosResult.Items)
            {
                itemResults.Add(_mapper.Map<ProviderTestSearchResultItemViewModel>(searchResult));
            }

            results.Providers = itemResults.AsEnumerable();

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
