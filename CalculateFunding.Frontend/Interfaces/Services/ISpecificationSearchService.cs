namespace CalculateFunding.Frontend.Interfaces.Services
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Specs;

    public interface ISpecificationSearchService
    {
        Task<SpecificationSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}