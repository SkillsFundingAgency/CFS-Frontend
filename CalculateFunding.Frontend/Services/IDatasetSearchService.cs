namespace CalculateFunding.Frontend.Services
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Datasets;

    public interface IDatasetSearchService
    {
        Task<DatasetSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}
