namespace CalculateFunding.Frontend.Services
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;

    public interface IProviderSearchService
    {
        Task<ProviderSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}
