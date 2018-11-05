namespace CalculateFunding.Frontend.Clients.ScenariosClient
{
    using System.Net;
    using System.Net.Http;
    using System.Threading.Tasks;
    using CalculateFunding.Common.Utility;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Http;
    using Serilog;

    public class ScenariosApiClient : BaseApiClient, IScenariosApiClient
    {
        public ScenariosApiClient(IHttpClientFactory httpClientFactory, ILogger logger, IHttpContextAccessor contextAccessor)
           : base(httpClientFactory, HttpClientKeys.Scenarios, logger, contextAccessor)
        {
        }

        public async Task<PagedResult<ScenarioSearchResultItem>> FindScenarios(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<ScenarioSearchResultItem>> results = await PostAsync<SearchResults<ScenarioSearchResultItem>, SearchQueryRequest>("scenarios-search", request);

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

        public Task<ApiResponse<TestScenario>> CreateTestScenario(CreateScenarioModel testScenario)
        {
            Guard.ArgumentNotNull(testScenario, nameof(testScenario));

            return PostAsync<TestScenario, CreateScenarioModel>("save-scenario-test-version", testScenario);
        }

        public Task<ApiResponse<TestScenario>> UpdateTestScenario(TestScenarioUpdateModel testScenario)
        {
            Guard.ArgumentNotNull(testScenario, nameof(testScenario));

            return PostAsync<TestScenario, TestScenarioUpdateModel>("save-scenario-test-version", testScenario);
        }


        public Task<ApiResponse<TestScenario>> GetCurrentTestScenarioById(string scenarioId)
        {
            Guard.ArgumentNotNull(scenarioId, nameof(scenarioId));

            return GetAsync<TestScenario>($"get-current-scenario-by-id?scenarioId={scenarioId}");
        }
    }
}
