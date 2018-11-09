using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;

namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    public interface ITestEngineApiClient
    {
        /// <summary>
        /// Compiles Gerkin Test
        /// </summary>
        /// <param name="compileModel">Compile Model</param>
        /// <returns>Empty array on success, list of errors on failure</returns>
        Task<ApiResponse<IEnumerable<ScenarioCompileError>>> CompileScenario(ScenarioCompileModel compileModel);

        Task<PagedResult<TestScenarioSearchResultItem>> FindTestScenariosForProvider(SearchFilterRequest filterOptions);

        Task<PagedResult<ProviderTestSearchResultItem>> FindTestResults(SearchFilterRequest filterOptions);

        Task<ApiResponse<IEnumerable<TestScenarioResultCounts>>> GetTestResultCounts(TestScenarioResultCountsRequestModel testScenarioIdsModel);

        Task<ApiResponse<ProviderTestScenarioResultCounts>> GetProviderStatusCountsForTestScenario(string providerId);

        Task<ApiResponse<IEnumerable<SpecificationTestScenarioResultCounts>>> GetTestScenarioCountsForSpecifications(SpecificationIdsRequestModel specificationIds);

        Task<ApiResponse<ResultCounts>> GetTestScenarioCountsForProviderForSpecification(string specificationId, string providerId);
    }
}
