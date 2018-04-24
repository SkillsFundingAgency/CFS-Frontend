namespace CalculateFunding.Frontend.Clients.ScenariosClient
{
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using CalculateFunding.Frontend.Interfaces.Core;
    using CalculateFunding.Frontend.Interfaces.Core.Logging;
    using Microsoft.Extensions.Options;
    using Serilog;

    public class ScenariosApiClient : AbstractApiClient, IScenariosApiClient
    {
        private readonly string _testsPath;

        public ScenariosApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILogger logger, ICorrelationIdProvider correlationIdProvider)
           : base(options, httpClient, logger, correlationIdProvider)
        {
            _testsPath = options.Value.ScenariosPath ?? "/api/scenarios";
        }

        public async Task<PagedResult<ScenarioSearchResultItem>> FindScenarios(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<ScenarioSearchResultItem>> results = await PostAsync<SearchResults<ScenarioSearchResultItem>, SearchQueryRequest>($"{_testsPath}/scenarios-search", request);

            if (results.StatusCode == HttpStatusCode.OK)
            {
                PagedResult<ScenarioSearchResultItem> result = new SearchPagedResult<ScenarioSearchResultItem>(filterOptions, results.Content.TotalCount)
                {
                    Items = results.Content.Results,

                    Facets = results.Content.Facets,
                };

                return result;
            }
            else
            {
                return null;
            }
        }

        public Task<ApiResponse<Scenario>> GetScenarioById(string scenarioId)
        {
            Guard.IsNullOrWhiteSpace(scenarioId, nameof(scenarioId));

            return GetAsync<Scenario>($"{_testsPath}/get-scenario-by-id?scenarioId={scenarioId}");
        }

        public Task<ApiResponse<Scenario>> CreateTestScenario(CreateScenarioModel testScenario)
        {
            Guard.ArgumentNotNull(testScenario, nameof(testScenario));

            return PostAsync<Scenario, CreateScenarioModel>($"{_testsPath}/save-scenario-test-version", testScenario);
        }
    }
}
