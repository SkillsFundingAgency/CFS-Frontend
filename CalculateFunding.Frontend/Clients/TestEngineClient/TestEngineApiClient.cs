using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;
using Serilog;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Clients.TestEngineClient
{
    public class TestEngineApiClient : AbstractApiClient, ITestEngineApiClient
    {
        private readonly string _apiPath;

        public TestEngineApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILogger logger, ICorrelationIdProvider correlationIdProvider)
              : base(options, httpClient, logger, correlationIdProvider)
        {
            _apiPath = options.Value.TestEnginePath ?? "/api/tests";
        }

        public Task<ApiResponse<IEnumerable<ScenarioCompileError>>> CompileScenario(ScenarioCompileModel compileModel)
        {
            Guard.ArgumentNotNull(compileModel, nameof(compileModel));

            return PostAsync<IEnumerable<ScenarioCompileError>, ScenarioCompileModel>($"{_apiPath}/validate-test", compileModel);
        }

 
        public async Task<PagedResult<TestScenarioSearchResultItem>> FindTestScenariosForProvider(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<TestScenarioSearchResultItem>> results = await PostAsync<SearchResults<TestScenarioSearchResultItem>, SearchQueryRequest>($"{_apiPath}/testscenario-search", request);
            if (results.StatusCode == HttpStatusCode.OK)
            {
                PagedResult<TestScenarioSearchResultItem> result = new SearchPagedResult<TestScenarioSearchResultItem>(filterOptions, results.Content.TotalCount)
                {
                    Items = results.Content.Results
                };

                return result;
            }
            else
            {
                return null;
            }
        }


        public Task<ApiResponse<IEnumerable<TestScenarioResultCounts>>> GetTestResultCounts(TestScenarioResultCountsRequestModel testScenarioIdsModel)
        {
            Guard.ArgumentNotNull(testScenarioIdsModel, nameof(testScenarioIdsModel));

            return PostAsync<IEnumerable<TestScenarioResultCounts>, TestScenarioResultCountsRequestModel>($"{_apiPath}/get-result-counts", testScenarioIdsModel);
        }

        public Task<ApiResponse<ProviderTestScenarioResultCounts>> GetProviderStatusCountsForTestScenario(string providerId)
        {
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            return GetAsync<ProviderTestScenarioResultCounts>($"{_apiPath}/get-testscenario-result-counts-for-provider?providerId={providerId}");
        }

        public async Task<PagedResult<ProviderTestSearchResultItem>> FindTestResults(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<ProviderTestSearchResultItem>> results = await PostAsync<SearchResults<ProviderTestSearchResultItem>, SearchQueryRequest>($"{_apiPath}/testscenario-search", request);

            if (results.StatusCode == HttpStatusCode.OK)
            {
                PagedResult<ProviderTestSearchResultItem> result = new SearchPagedResult<ProviderTestSearchResultItem>(filterOptions, results.Content.TotalCount)
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

        public Task<ApiResponse<IEnumerable<SpecificationTestScenarioResultCounts>>> GetTestScenarioCountsForSpecifications(SpecificationIdsRequestModel specificationIds)
        {
            Guard.ArgumentNotNull(specificationIds, nameof(specificationIds));

            return PostAsync<IEnumerable<SpecificationTestScenarioResultCounts>, SpecificationIdsRequestModel>($"{_apiPath}/get-testscenario-result-counts-for-specifications", specificationIds);
        }
    }
}
