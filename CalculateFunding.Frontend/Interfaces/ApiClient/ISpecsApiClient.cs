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

        Task<ApiResponse<List<Specification>>> GetSpecifications();

        Task<ApiResponse<List<Specification>>> GetSpecifications(string academicYearId);

        Task<HttpStatusCode> PostSpecification(CreateSpecificationModel specification);

        Task<HttpStatusCode> PostProduct(string specificationId, Product product);

        Task<ApiResponse<IEnumerable<Reference>>> GetAcademicYears();

        Task<ApiResponse<IEnumerable<Reference>>> GetFundingStreams();

        Task<ApiResponse<Policy>> GetPolicyBySpecificationIdAndPolicyName(string specificationId, string policyName);

        Task<ApiResponse<Policy>> PostPolicy(CreatePolicyModel policy);

        Task<ApiResponse<Calculation>> GetCalculationBySpecificationIdAndCalculationName(string specificationId, string calculationName);

        Task<ApiResponse<Calculation>> GetCalculationById(string specificationId, string calculationId);

        Task<ApiResponse<Calculation>> PostCalculation(CreateCalculationModel calculation);

        Task<ApiResponse<IEnumerable<Reference>>> GetAllocationLines();

        Task<PagedResult<SpecificationDatasourceRelationshipSearchResultItem>> FindSpecificationAndRelationships(SearchFilterRequest filterOptions);
    }
}