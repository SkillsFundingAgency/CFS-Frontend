﻿using System.Threading.Tasks;
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
        Task<PagedResult<CalculationSearchResultItem>> FindCalculations(CalculationSearchFilterRequest queryOptions);

        /// <summary>
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