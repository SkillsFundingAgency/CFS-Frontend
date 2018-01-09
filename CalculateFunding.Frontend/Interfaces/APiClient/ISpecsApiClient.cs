using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.CreateModels;

namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
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
    }
}