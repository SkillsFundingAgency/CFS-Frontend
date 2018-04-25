using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;
using CalculateFunding.Frontend.ViewModels.Scenarios;
using Serilog;

namespace CalculateFunding.Frontend.Services
{
    public class TestScenarioResultsService : ITestScenarioResultsService
    {
        private IScenarioSearchService _scenariosSearchService;
        private ISpecsApiClient _specsClient;
        private ITestEngineApiClient _testEngineClient;
        private IMapper _mapper;
        private ILogger _logger;

        public TestScenarioResultsService(IScenarioSearchService scenariosApiClient, ISpecsApiClient specsApiClient, ITestEngineApiClient testEngineApiClient, IMapper mapper, ILogger logger)
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
            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                IncludeFacets = false,
                SearchTerm = request.SearchTerm,
                Filters = request.Filters,
                PageNumber = request.PageNumber,
                PageSize = 20,
            };

            if (searchRequest.Filters == null)
            {
                searchRequest.Filters = new Dictionary<string, string[]>();
            }

            if (!string.IsNullOrWhiteSpace(request.SpecificationId))
            {
                if (searchRequest.Filters.ContainsKey("specificationId") && searchRequest.Filters["specificationId"] != null && searchRequest.Filters["specificationId"].Contains(request.SpecificationId))
                {
                    searchRequest.Filters.Add("specificationId", new string[] { request.SpecificationId });
                }
                else if (!searchRequest.Filters.ContainsKey("specificationId"))
                {
                    searchRequest.Filters.Add("specificationId", new string[] { request.SpecificationId });
                }
            }

            ScenarioSearchResultViewModel scenarioSearchResults = await _scenariosSearchService.PerformSearch(searchRequest);

            IEnumerable<string> testScenarioIds = scenarioSearchResults.Scenarios.Select(s => s.Id);
            TestScenarioResultViewModel result = _mapper.Map<TestScenarioResultViewModel>(scenarioSearchResults);

            if (testScenarioIds.Any())
            {
                ApiResponse<IEnumerable<TestScenarioResultCounts>> rowCounts = await _testEngineClient.GetTestResultCounts(new TestSecenarioResultCountsRequestModel()
                {
                    TestScenarioIds = testScenarioIds,
                });

                if (rowCounts.StatusCode != System.Net.HttpStatusCode.OK)
                {
                    return null;
                }


                foreach (TestScenarioResultItemViewModel vm in result.TestResults)
                {
                    TestScenarioResultCounts counts = rowCounts.Content.Where(r => r.TestScenarioId == vm.Id).FirstOrDefault();
                    if (counts != null)
                    {
                        vm.Failures = counts.Failed;
                        vm.Passes = counts.Passed;
                    }
                }
            }

            return result;

        }
    }
}
