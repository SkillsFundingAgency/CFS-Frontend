using CalculateFunding.Common.ApiClient.Calcs.Models;
using CalculateFunding.Common.ApiClient.Models;

namespace CalculateFunding.Frontend.Interfaces.Services
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.ViewModels.Calculations;
    using CalculateFunding.Frontend.ViewModels.Common;

    public interface ICalculationSearchService
    {
        Task<CalculationSearchResultViewModel> PerformSearch(SearchRequestViewModel request);

        Task<CalculationSearchResultViewModel> PerformSearch(string specificationId,
            CalculationType calculationType,
            PublishStatus? status,
            string searchTerm,
            int? page);
    }
}