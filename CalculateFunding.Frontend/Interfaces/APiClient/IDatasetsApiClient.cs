using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;

namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    public interface IDatasetsApiClient
    {
        /// <summary>
        /// Gets a paged list of datasets, given the paged query options and search options
        /// </summary>
        /// <param name="filterOptions">Filter Options</param>
        /// <returns>List of Calculations</returns>
        Task<PagedResult<DatasetSearchResultItem>> FindDatasets(SearchFilterRequest filterOptions);
    }
}
