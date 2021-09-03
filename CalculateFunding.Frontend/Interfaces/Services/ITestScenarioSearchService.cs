namespace CalculateFunding.Frontend.Interfaces.Services
{
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.TestEngine;
    using System.Threading.Tasks;

    public interface ITestScenarioSearchService
    {
        Task<TestScenarioSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}