namespace CalculateFunding.Frontend.Services
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;

    public interface ICalculationProviderResultsSearchService
    {
        Task<CalculationProviderResultSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}
