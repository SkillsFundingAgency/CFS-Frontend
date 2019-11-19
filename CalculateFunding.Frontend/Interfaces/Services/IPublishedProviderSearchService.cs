using System.Threading.Tasks;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Results;

namespace CalculateFunding.Frontend.Interfaces.Services
{
    public interface IPublishedProviderSearchService
    {
	    Task<PublishProviderSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}
