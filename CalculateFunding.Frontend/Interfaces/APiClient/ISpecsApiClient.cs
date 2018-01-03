using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;

namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    public interface ISpecsApiClient
    {
        Task<ApiResponse<Specification>> GetSpecification(string id);
        Task<ApiResponse<Product>> GetProduct(string budgetId, string productId);
        Task<ApiResponse<List<Specification>>> GetSpecifications();
        Task<HttpStatusCode> PostSpecification(Specification budget);
        Task<HttpStatusCode> PostProduct(string budgetId, Product product);
    }
}