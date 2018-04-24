using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.TestEngineClient.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

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

        Task<PagedResult<ProviderTestSearchResultItem>> FindTestResults(SearchFilterRequest filterOptions);
    }
}
