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

        /// <summary>
        /// Get Specification By Name
        /// </summary>
        /// <param name="specificationName">Specification Name</param>
        /// <returns>Specification when exists, null when it doesn't</returns>
        Task<ApiResponse<Specification>> GetSpecificationByName(string specificationName);

        Task<ApiResponse<Product>> GetProduct(string specificationId, string productId);

        /// <summary>
        /// Gets all Specifications
        /// </summary>
        /// <returns></returns>
        Task<ApiResponse<IEnumerable<Specification>>> GetSpecifications();

        /// <summary>
        /// Gets Specifications by Academic Year ID
        /// </summary>
        /// <param name="fundingPeriodId">Academic Year Id</param>
        /// <returns></returns>
        Task<ApiResponse<IEnumerable<Specification>>> GetSpecifications(string fundingPeriodId);

        Task<HttpStatusCode> CreateSpecification(CreateSpecificationModel specification);

        Task<HttpStatusCode> CreateProduct(string specificationId, Product product);

        Task<ApiResponse<IEnumerable<Reference>>> GetFundingPeriods();

        Task<ApiResponse<IEnumerable<FundingStream>>> GetFundingStreams();

        Task<ApiResponse<IEnumerable<FundingStream>>> GetFundingStreamsForSpecification(string specificationId);

        Task<ApiResponse<Policy>> GetPolicyBySpecificationIdAndPolicyName(string specificationId, string policyName);

        Task<ApiResponse<Policy>> CreatePolicy(CreatePolicyModel policy);

        Task<ApiResponse<Calculation>> GetCalculationBySpecificationIdAndCalculationName(string specificationId, string calculationName);

        Task<ApiResponse<Calculation>> GetCalculationById(string specificationId, string calculationId);

        Task<ApiResponse<Calculation>> CreateCalculation(CreateCalculationModel calculation);

        Task<ApiResponse<FundingStream>> GetFundingStreamByFundingStreamId(string fundingStreamId);

        Task<PagedResult<SpecificationDatasourceRelationshipSearchResultItem>> FindSpecificationAndRelationships(SearchFilterRequest filterOptions);

        Task<HttpStatusCode> UpdateSpecification(string specificationId, EditSpecificationModel specification);
    }
}