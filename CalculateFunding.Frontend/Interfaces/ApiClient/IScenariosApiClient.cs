namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IScenariosApiClient
    {

        /// <summary>
        /// Gets a paged list of scenarios based on paged query options
        /// </summary>
        /// <param name="filterOptions"></param>
        /// <returns>List of Scenarios </returns>

        // Task<PagedResult<ScenarioSearchResultItem>> FindScenarios(SearchFilterRequest filterOptions);


        /// <summary>
        /// Creates a test scenario 
        /// </summary>
        /// <param name="TestScenario"></param>
        /// <returns></returns>
        Task<ApiResponse<Scenario>> CreateTestScenario(CreateScenarioModel TestScenario);


       // Task<ApiResponse<ScenarioSearchResults>> GetScenarioResults(string periodId, string specificationId);
         //Task<PagedResult<ScenarioSearchResultItem>> GetScenarioResults(SearchRequestViewModel request);


        /// <summary>
        /// Gets a paged list of test scenarios, given the paged query options and search options
        /// </summary>
        /// <param name="filterOptions">Filter Options</param>
        /// <returns>List of Scenarios</returns>
        Task<PagedResult<ScenarioSearchResultItem>> FindScenarios(SearchFilterRequest filterOptions);
    }
}
