using System.Threading.Tasks;
using CalculateFunding.Frontend.ViewModels.Calculations;
using CalculateFunding.Frontend.ViewModels.Common;

namespace CalculateFunding.Frontend.Services
{
    public interface ICalculationSearchService
    {
        Task<CalculationSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}
