namespace CalculateFunding.Frontend.Interfaces.Services
{
    using CalculateFunding.Frontend.ViewModels.Results;
    using System.Threading.Tasks;

    public interface ITestScenarioResultsService
    {
        Task<TestScenarioResultViewModel> PerformSearch(TestScenarioResultRequestViewModel request);
    }
}
