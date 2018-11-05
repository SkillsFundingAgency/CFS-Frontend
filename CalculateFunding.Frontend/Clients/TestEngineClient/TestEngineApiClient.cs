using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Http;
using Serilog;

namespace CalculateFunding.Frontend.Clients.TestEngineClient
{
    public class TestEngineApiClient : BaseApiClient, ITestEngineApiClient
    {

        public TestEngineApiClient(IHttpClientFactory httpClientFactory, ILogger logger, IHttpContextAccessor contextAccessor)
              : base(httpClientFactory, HttpClientKeys.TestEngine, logger, contextAccessor)
        {
        }

        public Task<ApiResponse<IEnumerable<ScenarioCompileError>>> CompileScenario(ScenarioCompileModel compileModel)
        {
            Guard.ArgumentNotNull(compileModel, nameof(compileModel));

            return PostAsync<IEnumerable<ScenarioCompileError>, ScenarioCompileModel>("validate-test", compileModel);
        }

        public async Task<PagedResult<TestScenarioSearchResultItem>> FindTestScenariosForProvider(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<TestScenarioSearchResultItem>> results = await PostAsync<SearchResults<TestScenarioSearchResultItem>, SearchQueryRequest>("testscenario-search", request);
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

            return PostAsync<IEnumerable<TestScenarioResultCounts>, TestScenarioResultCountsRequestModel>("get-result-counts", testScenarioIdsModel);
        }

        public Task<ApiResponse<ProviderTestScenarioResultCounts>> GetProviderStatusCountsForTestScenario(string providerId)
        {
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            return GetAsync<ProviderTestScenarioResultCounts>($"get-testscenario-result-counts-for-provider?providerId={providerId}");
        }

        public async Task<PagedResult<ProviderTestSearchResultItem>> FindTestResults(SearchFilterRequest filterOptions)
        {
            Guard.ArgumentNotNull(filterOptions, nameof(filterOptions));

            SearchQueryRequest request = SearchQueryRequest.FromSearchFilterRequest(filterOptions);

            ApiResponse<SearchResults<ProviderTestSearchResultItem>> results = await PostAsync<SearchResults<ProviderTestSearchResultItem>, SearchQueryRequest>("testscenario-search", request);

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

            return PostAsync<IEnumerable<SpecificationTestScenarioResultCounts>, SpecificationIdsRequestModel>("get-testscenario-result-counts-for-specifications", specificationIds);
        }

        public Task<ApiResponse<ResultCounts>> GetTestScenarioCountsForProviderForSpecification(string specificationId, string providerId)
        {
            return GetAsync<ResultCounts>($"get-testscenario-result-counts-for-specification-for-provider?specificationId={specificationId}&providerId={providerId}");
        }
    }
}
