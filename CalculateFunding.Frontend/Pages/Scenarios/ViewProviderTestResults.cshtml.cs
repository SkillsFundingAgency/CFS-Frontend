namespace CalculateFunding.Frontend.Pages.Scenarios
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
    using CalculateFunding.Frontend.Extensions;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Scenarios;
    using CalculateFunding.Frontend.ViewModels.TestEngine;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class ViewProviderTestResultsPageModel : PageModel
    {
        private readonly ITestResultsSearchService _testResultsSearchService;
        private readonly ITestEngineApiClient _testEngineClient;
        private readonly IScenariosApiClient _scenariosApiClient;
        private readonly IMapper _mapper;

        public ViewProviderTestResultsPageModel(
            ITestResultsSearchService testResultsSearchService,
            ITestEngineApiClient testEngineApiClient,
            IScenariosApiClient scenariosApiClient,
            IMapper mapper)
        {
            Guard.ArgumentNotNull(testResultsSearchService, nameof(testResultsSearchService));
            Guard.ArgumentNotNull(testEngineApiClient, nameof(testEngineApiClient));
            Guard.ArgumentNotNull(scenariosApiClient, nameof(scenariosApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _testResultsSearchService = testResultsSearchService;
            _testEngineClient = testEngineApiClient;
            _scenariosApiClient = scenariosApiClient;
            _mapper = mapper;
        }

        [BindProperty]
        public string SearchTerm { get; set; }

        public ProviderTestsSearchResultViewModel ProviderResults { get; set; }

        public ScenarioViewModel TestScenario { get; set; }

        public decimal TestCoverage { get; set; }

        public async Task<IActionResult> OnGetAsync(string scenarioId, int? pageNumber, string searchTerm)
        {
            TestScenario = await GetTestScenario(scenarioId);

            if (TestScenario == null)
            {
                return new NotFoundResult();
            }

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                IncludeFacets = false,
                SearchTerm = searchTerm,
                Filters = new Dictionary<string, string[]> { { "testScenarioId", new[] { scenarioId } } }
            };

            SearchTerm = searchTerm;

            Task<ProviderTestsSearchResultViewModel> providerResultsTask = _testResultsSearchService.PerformProviderTestResultsSearch(searchRequest);
            Task<ApiResponse<IEnumerable<TestScenarioResultCounts>>> countTask = _testEngineClient.GetTestResultCounts(new TestSecenarioResultCountsRequestModel()
            {
                TestScenarioIds = new string[] { scenarioId }
            });


            await TaskHelper.WhenAllAndThrow(providerResultsTask, countTask);

            ProviderResults = providerResultsTask.Result;

            if (ProviderResults == null)
            {
                return new InternalServerErrorResult("Provider Results returned null");
            }

            if ( countTask.Result == null)
            {
                return new InternalServerErrorResult("Count Task result was null");
            }

            if (countTask.Result.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new InternalServerErrorResult($"Count Task didn't return OK, but instead '{countTask.Result.StatusCode}'");
            }

            if (countTask.Result.Content == null)
            {
                return new InternalServerErrorResult("Count Task result content was null");
            }

            TestScenarioResultCounts scenarioResultCounts = countTask.Result.Content.FirstOrDefault();
            if (scenarioResultCounts != null)
            {
                TestCoverage = scenarioResultCounts.TestCoverage;
            }
            else
            {
                TestCoverage = 0;
            }


            return Page();
        }

        public Task<IActionResult> OnPostAsync(string scenarioId, int? pageNumber, string searchTerm)
        {
            return OnGetAsync(scenarioId, pageNumber, searchTerm);
        }

        private async Task<ScenarioViewModel> GetTestScenario(string scenarioId)
        {
            ApiResponse<Scenario> scenario = await _scenariosApiClient.GetScenarioById(scenarioId);

            if (scenario.Content == null)
            {
                return null;
            }

            return _mapper.Map<ScenarioViewModel>(scenario.Content);
        }
    }
}