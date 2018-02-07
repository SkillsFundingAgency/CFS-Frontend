using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.CalcsClient.Models;
using CalculateFunding.Frontend.Clients.CommonModels;

namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    public interface ICalculationsApiClient
    {
        /// <summary>
        /// Gets a paged list of calculations, given the paged query options
        /// </summary>
        /// <param name="filterOptions">Filter Options</param>
        /// <returns>List of Calculations</returns>
        Task<PagedResult<CalculationSearchResultItem>> FindCalculations(SearchFilterRequest filterOptions);

        /// <summary>
        /// Gets all versions of a calculation
        /// </summary>
        /// <param name="calculationId"></param>
        /// <returns>Calculation object, otherwise null if not found</returns>
        Task<IEnumerable<Calculation>> GetVersionsByCalculationId(string calculationId);

        Task<ApiResponse<IEnumerable<CalculationVersion>>> GetMultipleVersionsByCalculationId(IEnumerable<int> versionIds, string calculationId);
                                        
        Task<ApiResponse<IEnumerable<CalculationVersion>>> GetAllVersionsByCalculationId(string calculationID);

        /// Gets an individual calculation
        /// </summary>
        /// <param name="calculationId">Calculation ID</param>
        /// <returns>Calculation object, otherwise null if not found</returns>
        Task<ApiResponse<Calculation>> GetCalculationById(string calculationId);

        /// <summary>
        /// Update a Calculation
        /// </summary>
        /// <param name="calculationId">Calcuation Id</param>
        /// <param name="calculation">Updated Calculation</param>
        /// <returns>Updated Calculation</returns>
        Task<ApiResponse<Calculation>> UpdateCalculation(string calculationId, CalculationUpdateModel calculation);

        /// <summary>
        /// Preview Compile Request
        /// </summary>
        /// <param name="request">Code compile request</param>
        /// <returns>Preview Compile Response</returns>
        Task<ApiResponse<PreviewCompileResult>> PreviewCompile(PreviewCompileRequest request);
    }
}