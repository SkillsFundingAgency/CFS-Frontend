namespace CalculateFunding.Frontend.Services
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using CalculateFunding.Common.ApiClient.Providers.Models;
    using CalculateFunding.Frontend.ViewModels.Common;
    using CalculateFunding.Frontend.ViewModels.Results;

    public interface IProviderSearchService
    {
        Task<IEnumerable<ProviderVersionMetadata>> GetProviderVersionsByFundingStream(string fundingStreamId);

        Task<ProviderSearchResultViewModel> PerformSearch(SearchRequestViewModel request);
    }
}
