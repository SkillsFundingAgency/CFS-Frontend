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
        Task<ApiResponse<Product>> GetProduct(string specificationId, string productId);
        Task<ApiResponse<List<Specification>>> GetSpecifications();
        Task<ApiResponse<List<Specification>>> GetSpecifications(string academicYearId);
        Task<HttpStatusCode> PostSpecification(CreateSpecificationModel specification);
        Task<HttpStatusCode> PostProduct(string specificationId, Product product);
        Task<ApiResponse<Reference[]>> GetAcademicYears();
        Task<ApiResponse<Reference[]>> GetFundingStreams();
    }
}