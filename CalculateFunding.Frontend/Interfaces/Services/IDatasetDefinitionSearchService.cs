namespace CalculateFunding.Frontend.Services
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Datasets;

    public interface IDatasetDefinitionSearchService
    {
        Task<DatasetDefinitionSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}