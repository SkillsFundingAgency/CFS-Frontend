using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Providers.Models;

namespace CalculateFunding.Frontend.Services
{
    public interface IProviderSearchService
    {
        Task<IEnumerable<ProviderVersionMetadata>> GetProviderVersionsByFundingStream(string fundingStreamId);
    }
}
