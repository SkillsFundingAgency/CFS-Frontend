namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CalcsClient.Models;
    using CalculateFunding.Frontend.Clients.CommonModels;

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
        /// <param name="calculationId">Calculation ID</param>
        /// <returns>Calculation object, otherwise null if not found</returns>
        Task<IEnumerable<Calculation>> GetVersionsByCalculationId(string calculationId);

        /// <summary>
        /// Get code context for Specification.
        /// This includes methods, datasets and providers available to call from calculation code
        /// </summary>
        /// <param name="specificationId">Specification Id</param>
        /// <returns>Code context/returns>
        Task<ApiResponse<IEnumerable<TypeInformation>>> GetCodeContextForSpecification(string specificationId);

        Task<ApiResponse<IEnumerable<CalculationVersion>>> GetMultipleVersionsByCalculationId(IEnumerable<int> versionIds, string calculationId);

        Task<ApiResponse<IEnumerable<CalculationVersion>>> GetAllVersionsByCalculationId(string calculationId);

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
        /// <param name="calculation">Calculation details to update</param>
        /// <returns>Updated Calculation</returns>
        Task<ApiResponse<Calculation>> UpdateCalculation(string calculationId, CalculationUpdateModel calculation);

        /// <summary>
        /// Preview Compile Request
        /// </summary>
        /// <param name="request">Code compile request</param>
        /// <returns>Preview Compile Response</returns>
        Task<ApiResponse<PreviewCompileResult>> PreviewCompile(PreviewCompileRequest request);

        /// <summary>
        /// Update a Calculation status
        /// </summary>
        /// <param name="calculationId">Calcuation Id</param>
        /// <param name="model">Status model</param>
        /// <returns>Updated calculation version</returns>
        Task<ValidatedApiResponse<PublishStatusResult>> UpdatePublishStatus(string calculationId, PublishStatusEditModel model);

        /// <summary>
        /// Get calculation approval status counts for a list of specifications
        /// </summary>
        /// <param name="request">Request including Specification IDS</param>
        /// <returns></returns>
        Task<ApiResponse<IEnumerable<CalculationStatusCounts>>> GetCalculationStatusCounts(SpecificationIdsRequestModel request);
    }
}