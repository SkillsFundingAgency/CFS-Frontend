namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.ScenariosClient.Models;
    using System.Threading.Tasks;

    public interface IScenariosApiClient
    {
        Task<ApiResponse<Scenario>> CreateTestScenario(CreateScenarioModel TestScenario);

        Task<PagedResult<ScenarioSearchResultItem>> FindScenarios(SearchFilterRequest filterOptions);

        Task<ApiResponse<Scenario>> GetScenarioById(string scenarioId);
    }
}
