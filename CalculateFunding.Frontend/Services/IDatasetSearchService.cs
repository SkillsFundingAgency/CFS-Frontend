using System.Threading.Tasks;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Datasets;

namespace CalculateFunding.Frontend.Services
{
    public interface IDatasetSearchService
    {
        Task<DatasetSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}
