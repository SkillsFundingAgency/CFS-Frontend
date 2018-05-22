namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    using System.Collections.Generic;
    using System.Net;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;

    public interface ISpecsApiClient
    {
        Task<ApiResponse<Specification>> GetSpecification(string specificationId);

        Task<ApiResponse<SpecificationSummary>> GetSpecificationSummary(string specificationId);

        /// <summary>
        /// Get Specification By Name
        /// </summary>
        /// <param name="specificationName">Specification Name</param>
        /// <returns>Specification when exists, null when it doesn't</returns>
        Task<ApiResponse<Specification>> GetSpecificationByName(string specificationName);

        /// <summary>
        /// Gets all Specifications
        /// </summary>
        /// <returns></returns>
        Task<ApiResponse<IEnumerable<Specification>>> GetSpecifications();

        /// <summary>
        /// Gets all Specification Summaries
        /// </summary>
        /// <returns></returns>
        Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecificationSummaries();

        /// <summary>
        /// Gets all Specification Summaries given provided Specification IDs
        /// </summary>
        /// <returns></returns>
        /// <param name="specificationIds">Specification IDs</param>
        Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecificationSummaries(IEnumerable<string> specificationIds);

        /// <summary>
        /// Gets Specifications by Academic Year ID
        /// </summary>
        /// <param name="fundingPeriodId">Academic Year Id</param>
        /// <returns></returns>
        Task<ApiResponse<IEnumerable<SpecificationSummary>>> GetSpecifications(string fundingPeriodId);

        Task<HttpStatusCode> CreateSpecification(CreateSpecificationModel specification);

        Task<ApiResponse<IEnumerable<Reference>>> GetFundingPeriods();

        Task<ApiResponse<IEnumerable<FundingStream>>> GetFundingStreams();

        Task<ApiResponse<IEnumerable<FundingStream>>> GetFundingStreamsForSpecification(string specificationId);

        Task<ApiResponse<Policy>> GetPolicyBySpecificationIdAndPolicyName(string specificationId, string policyName);

        Task<ApiResponse<Policy>> CreatePolicy(CreatePolicyModel policy);

        Task<ValidatedApiResponse<Policy>> UpdatePolicy(string specificationId, string policyId, EditPolicyModel updatedPolicy);

        Task<ApiResponse<Calculation>> GetCalculationBySpecificationIdAndCalculationName(string specificationId, string calculationName);

        Task<ApiResponse<Calculation>> GetCalculationById(string specificationId, string calculationId);

        Task<ApiResponse<Calculation>> CreateCalculation(CreateCalculationModel calculation);

        Task<ApiResponse<FundingStream>> GetFundingStreamByFundingStreamId(string fundingStreamId);

        Task<PagedResult<SpecificationDatasourceRelationshipSearchResultItem>> FindSpecificationAndRelationships(SearchFilterRequest filterOptions);

        Task<HttpStatusCode> UpdateSpecification(string specificationId, EditSpecificationModel specification);

    }
}