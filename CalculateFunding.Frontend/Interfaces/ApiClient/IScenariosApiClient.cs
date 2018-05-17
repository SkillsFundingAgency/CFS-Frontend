namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using System.Threading.Tasks;

    public interface IScenariosApiClient
    {

        /// <summary>
        /// Creates a test scenario 
        /// </summary>
        /// <param name="testScenario"></param>
        /// <returns></returns>
        Task<ApiResponse<TestScenario>> CreateTestScenario(CreateScenarioModel testScenario);

        /// <summary>
        /// Gets a paged list of test scenarios, given the paged query options and search options
        /// </summary>
        /// <param name="filterOptions">Filter Options</param>
        /// <returns>List of Scenarios</returns>
        Task<PagedResult<ScenarioSearchResultItem>> FindScenarios(SearchFilterRequest filterOptions);

        //Task<ApiResponse<Scenario>> GetScenarioById(string scenarioId);

        /// <summary>
        /// Saves a test scenario in edit page
        /// </summary>
        /// <param name="EditScenarioModel"></param>
        /// <returns></returns>
        Task<ApiResponse<TestScenario>> UpdateTestScenario(TestScenarioIUpdateModel editScenarioModel);

       Task<ApiResponse<TestScenario>> GetCurrentTestScenarioById(string scenarioId);
    }
}
