namespace CalculateFunding.Frontend.Services
{
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Scenarios;
    using System.Threading.Tasks;

    public interface IScenarioSearchService
    {
        Task<ScenarioSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}
