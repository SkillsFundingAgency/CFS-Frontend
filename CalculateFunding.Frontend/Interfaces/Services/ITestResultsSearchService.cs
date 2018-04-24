using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.TestEngine;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Interfaces.Services
{
    public interface ITestResultsSearchService
    {
        Task<ProviderTestsSearchResultViewModel> PerformProviderTestResultsSearch(SearchRequestViewModel request);
    }
}
