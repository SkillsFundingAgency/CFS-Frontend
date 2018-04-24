namespace CalculateFunding.Frontend.Pages.Scenarios
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using AutoMapper;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Scenarios;
    using CalculateFunding.Frontend.ViewModels.TestEngine;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class ViewProvideTestResultsPageModel : PageModel
    {
        private readonly ITestResultsSearchService _testResultsSearchService;
        private readonly IScenariosApiClient _scenariosApiClient;
        private readonly IMapper _mapper;

        public ViewProvideTestResultsPageModel(ITestResultsSearchService testResultsSearchService, 
            IScenariosApiClient scenariosApiClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(testResultsSearchService, nameof(testResultsSearchService));
            Guard.ArgumentNotNull(scenariosApiClient, nameof(scenariosApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _testResultsSearchService = testResultsSearchService;
            _scenariosApiClient = scenariosApiClient;
            _mapper = mapper;
        }

        [BindProperty]
        public string SearchTerm { get; set; }

        public ProviderTestsSearchResultViewModel ProviderResults { get; set; }

        public ScenarioViewModel TestScenario { get; set; }

        public async Task<IActionResult> OnGetAsync(string scenarioId, int? pageNumber, string searchTerm)
        {
            TestScenario = await GetTestScenario(scenarioId);

            if (TestScenario == null)
                return new NotFoundResult();

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                IncludeFacets = false,
                SearchTerm = searchTerm,
                Filters = new Dictionary<string, string[]> { { "testScenarioId", new[] { scenarioId } } }
            };

            SearchTerm = searchTerm;

            ProviderResults = await _testResultsSearchService.PerformProviderTestResultsSearch(searchRequest);

            if (ProviderResults == null)
            {
                return new StatusCodeResult(500);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(string scenarioId, int? pageNumber, string searchTerm)
        {
            TestScenario = await GetTestScenario(scenarioId);

            if (TestScenario == null)
                return new NotFoundResult();

            SearchRequestViewModel searchRequest = new SearchRequestViewModel()
            {
                PageNumber = pageNumber,
                SearchTerm = SearchTerm,
                IncludeFacets = true,
                Filters = new Dictionary<string, string[]> { { "testScenarioId", new[] { scenarioId } } }
            };

            SearchTerm = searchTerm;

            ProviderResults = await _testResultsSearchService.PerformProviderTestResultsSearch(searchRequest);

            if (ProviderResults == null)
            {
                return new StatusCodeResult(500);
            }

            return Page();
        }

        private async Task<ScenarioViewModel> GetTestScenario(string scenarioId)
        {
            ApiResponse<Scenario> scenario = await _scenariosApiClient.GetScenarioById(scenarioId);

            if(scenario.Content == null)
            {
                return null;
            }

            return _mapper.Map<ScenarioViewModel>(scenario.Content);
        }
    }
}