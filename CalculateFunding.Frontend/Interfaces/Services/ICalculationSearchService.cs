namespace CalculateFunding.Frontend.Interfaces.Services
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using CalculateFunding.Frontend.ViewModels.Common;

    public interface ICalculationSearchService
    {
        Task<CalculationSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}
