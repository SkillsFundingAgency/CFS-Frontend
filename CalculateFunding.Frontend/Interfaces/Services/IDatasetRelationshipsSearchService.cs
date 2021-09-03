namespace CalculateFunding.Frontend.Interfaces.Services
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;

    public interface IDatasetRelationshipsSearchService
    {
        Task<SpecificationDatasourceRelationshipSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}