﻿using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.TestEngine;
using Serilog;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Services
{
    public class TestScenarioSearchService : ITestScenarioSearchService
    {
        private const int PageSize = 50;
        private ITestEngineApiClient _testEngineApiClient;
        private IMapper _mapper;
        private ILogger _logger;


        public TestScenarioSearchService(ITestEngineApiClient testEngineApiClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(testEngineApiClient, nameof(testEngineApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _testEngineApiClient = testEngineApiClient;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<TestScenarioSearchResultViewModel> PerformSearch(SearchRequestViewModel request)
        {
            SearchFilterRequest requestOptions = new SearchFilterRequest()
            {
                Page = 1,
                PageSize = PageSize,
                SearchTerm = request.SearchTerm,
                IncludeFacets = false,
                Filters = request.Filters,
                SearchFields = new string[] { "TestScenarioName" }
            };

            if (request.PageNumber.HasValue && request.PageNumber.Value > 0)
            {
                requestOptions.Page = request.PageNumber.Value;
            }

            PagedResult<TestScenarioSearchResultItem> TestScenarioResult = await _testEngineApiClient.FindTestScenariosForProvider(requestOptions);

            if (TestScenarioResult == null)
            {
                _logger.Error("Find Test Scenarios HTTP request failed");
                return null;
            }

            TestScenarioSearchResultViewModel results = new TestScenarioSearchResultViewModel
            {
                TotalResults = TestScenarioResult.TotalItems,
                CurrentPage = TestScenarioResult.PageNumber
            };

            IList<SearchFacetViewModel> searchFacets = new List<SearchFacetViewModel>();

            if (TestScenarioResult.Facets != null)
            {
                foreach (SearchFacet facet in TestScenarioResult.Facets)
                {
                    searchFacets.Add(_mapper.Map<SearchFacetViewModel>(facet));
                }
            }

            results.Facets = searchFacets.AsEnumerable();

            List<TestScenarioSearchResultItemViewModel> itemResults = new List<TestScenarioSearchResultItemViewModel>();

            foreach (TestScenarioSearchResultItem searchResult in TestScenarioResult.Items)
            {
                itemResults.Add(_mapper.Map<TestScenarioSearchResultItemViewModel>(searchResult));
            }

            itemResults.OrderBy(f => f.LastUpdatedDate);

            results.TestScenarios = itemResults.AsEnumerable();

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

            if (results.EndItemNumber > TestScenarioResult.TotalItems)
            {
                results.EndItemNumber = TestScenarioResult.TotalItems;
            }

            results.PagerState = new PagerState(requestOptions.Page, TestScenarioResult.TotalPages, 4);

            return results;
        }
    }
}
