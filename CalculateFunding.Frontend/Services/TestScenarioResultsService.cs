using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using CalculateFunding.Frontend.ViewModels.Scenarios;
using Serilog;
using SearchMode = CalculateFunding.Common.Models.Search.SearchMode;

namespace CalculateFunding.Frontend.Services
{
    public class TestScenarioResultsService : ITestScenarioResultsService
    {
        private IScenarioSearchService _scenariosSearchService;
        private ISpecificationsApiClient _specsClient;
        private ITestEngineApiClient _testEngineClient;
        private IMapper _mapper;
        private ILogger _logger;

        public TestScenarioResultsService(IScenarioSearchService scenariosApiClient, ISpecificationsApiClient specsApiClient,
            ITestEngineApiClient testEngineApiClient, IMapper mapper, ILogger logger)
        {
            Guard.ArgumentNotNull(scenariosApiClient, nameof(scenariosApiClient));
            Guard.ArgumentNotNull(specsApiClient, nameof(specsApiClient));
            Guard.ArgumentNotNull(testEngineApiClient, nameof(testEngineApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _scenariosSearchService = scenariosApiClient;
            _specsClient = specsApiClient;
            _testEngineClient = testEngineApiClient;
            _mapper = mapper;
            _logger = logger;
        }
        public async Task<TestScenarioResultViewModel> PerformSearch(TestScenarioResultRequestViewModel request)
        {
            Guard.ArgumentNotNull(request, nameof(request));

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                IncludeFacets = false,
                SearchTerm = request.SearchTerm,
                Filters = request.Filters,
                PageNumber = request.PageNumber,
                PageSize = 20,
                SearchMode = SearchMode.All
            };

            if (searchRequest.Filters == null)
            {
                searchRequest.Filters = new Dictionary<string, string[]>();
            }

            SetFilterValue(searchRequest, "specificationId", request.SpecificationId);
            SetFilterValue(searchRequest, "fundingPeriodId", request.FundingPeriodId);

            Task<ScenarioSearchResultViewModel> scenarioSearchResultsTask = _scenariosSearchService.PerformSearch(searchRequest);
            Task<ApiResponse<IEnumerable<SpecificationSummary>>> specificationsLookupTask;

            if (string.IsNullOrWhiteSpace(request.FundingPeriodId))
            {
                specificationsLookupTask = _specsClient.GetSpecificationSummaries();
            }
            else
            {
                specificationsLookupTask = _specsClient.GetSpecifications(request.FundingPeriodId);
            }

            await TaskHelper.WhenAllAndThrow(scenarioSearchResultsTask, specificationsLookupTask);

            ScenarioSearchResultViewModel scenarioSearchResults = scenarioSearchResultsTask.Result;
            if (scenarioSearchResults == null)
            {
                _logger.Warning("Scenario Search Results response was null");
                throw new InvalidOperationException("Scenario Search Results response was null");
            }

            ApiResponse<IEnumerable<SpecificationSummary>> specificationsApiResponse = specificationsLookupTask.Result;
            if (specificationsApiResponse == null)
            {
                _logger.Warning("Specifications API Response was null");
                throw new InvalidOperationException("Specifications API Response was null");
            }

            if (specificationsApiResponse.StatusCode != HttpStatusCode.OK)
            {
                _logger.Warning("Specifications API Response content did not return OK, but instead {specificationsApiResponse.StatusCode}", specificationsApiResponse.StatusCode);
                throw new InvalidOperationException($"Specifications API Response content did not return OK, but instead '{specificationsApiResponse.StatusCode}'");
            }

            if (specificationsApiResponse.Content == null)
            {
                _logger.Warning("Specifications API Response content was null");
                throw new InvalidOperationException("Specifications API Response content was null");
            }

            IEnumerable<string> testScenarioIds = scenarioSearchResults.Scenarios.Select(s => s.Id);
            TestScenarioResultViewModel result = _mapper.Map<TestScenarioResultViewModel>(scenarioSearchResults);

            List<ReferenceViewModel> specifications = new List<ReferenceViewModel>();
            foreach (SpecificationSummary specification in specificationsApiResponse.Content.OrderBy(s => s.Name))
            {
                specifications.Add(new ReferenceViewModel(specification.Id, specification.Name));
            }

            result.Specifications = specifications;

            if (testScenarioIds.Any())
            {
                ApiResponse<IEnumerable<TestScenarioResultCounts>> rowCounts = await _testEngineClient.GetTestResultCounts(new TestScenarioResultCountsRequestModel()
                {
                    TestScenarioIds = testScenarioIds,
                });

                if (rowCounts == null)
                {
                    _logger.Warning("Row counts api request failed with null response");
                    throw new InvalidOperationException($"Row counts api request failed with null response");
                }

                if (rowCounts.StatusCode != HttpStatusCode.OK)
                {
                    _logger.Warning("Row counts api request failed with status code: {rowCounts.StatusCode}", rowCounts.StatusCode);
                    throw new InvalidOperationException($"Row counts api request failed with status code: {rowCounts.StatusCode}");
                }

                if (rowCounts.Content == null)
                {
                    _logger.Warning("Row counts api request failed with null content");
                    throw new InvalidOperationException($"Row counts api request failed with null content");
                }

                foreach (TestScenarioResultItemViewModel vm in result.TestResults)
                {
                    TestScenarioResultCounts counts = rowCounts.Content.Where(r => r.TestScenarioId == vm.Id).FirstOrDefault();
                    if (counts != null)
                    {
                        vm.Failures = counts.Failed;
                        vm.Passes = counts.Passed;
                        vm.Ignored = counts.Ignored;
                    }
                }
            }

            return result;
        }

        private static void SetFilterValue(SearchRequestViewModel searchRequest, string fieldKey, string value)
        {
            if (!string.IsNullOrWhiteSpace(value))
            {
                if (!searchRequest.Filters.ContainsKey(fieldKey))
                {
                    searchRequest.Filters.Add(fieldKey, new string[] { value });
                }

                if (searchRequest.Filters[fieldKey] == null)
                {
                    searchRequest.Filters.Add(fieldKey, new string[] { value });
                }

                if (!searchRequest.Filters[fieldKey].Contains(value))
                {
                    searchRequest.Filters[fieldKey] = searchRequest.Filters[fieldKey].Append(value).ToArray();
                }
            }
        }
    }
}
