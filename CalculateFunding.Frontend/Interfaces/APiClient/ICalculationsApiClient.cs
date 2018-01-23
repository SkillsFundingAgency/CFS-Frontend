using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Clients;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;

namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    public interface ICalculationsApiClient
    {
        /// <summary>
        /// Gets a paged list of calculations, given the paged query options
        /// </summary>
        /// <param name="queryOptions">Query Options</param>
        /// <returns>List of Calculations</returns>
        Task<PagedResult<CalculationSearchResult>> FindCalculations(PagedQueryOptions queryOptions);

        /// <summary>
        /// Gets an individual calculation
        /// </summary>
        /// <param name="calculationId">Calculation ID</param>
        /// <returns>Calculation object, otherwise null if not found</returns>
        Task<Calculation> GetCalculationById(string calculationId);
    }
}