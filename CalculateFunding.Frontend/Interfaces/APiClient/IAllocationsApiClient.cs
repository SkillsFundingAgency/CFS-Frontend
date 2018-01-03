//using System.Collections.Generic;
//using System.Net;
//using System.Threading.Tasks;
//using CalculateFunding.Frontend.ApiClient;
//using CalculateFunding.Frontend.ApiClient.Models;
//using CalculateFunding.Frontend.ApiClient.Models.Results;

//namespace CalculateFunding.Frontend.Interfaces.APiClient
//{
//    public interface IAllocationsApiClient
//    {
//        Task<ApiResponse<AllocationLine>> GetAllocationLine(string budgetId, string allocationLineId);
//        Task<ApiResponse<T>> GetAsync<T>(string url);
//        Task<ApiResponse<Specification>> GetBudget(string id);
//        Task<ApiResponse<BudgetSummary[]>> GetBudgetResults();
//        Task<ApiResponse<Specification[]>> GetBudgets();
//        Task<ApiResponse<Product>> GetProduct(string budgetId, string productId);
//        Task<ApiResponse<ProviderTestResult>> GetProviderResult(string budgetId, string providerId);
//        Task<ApiResponse<ProviderTestResult[]>> GetProviderResults(string budgetId);
//        Task<ApiResponse<List<Specification>>> GetSpecifications();
//        Task<HttpStatusCode> PostBudget(Specification budget);
//        Task<ApiResponse<PreviewResponse>> PostPreview(PreviewRequest request);
//        Task<HttpStatusCode> PostProduct(string budgetId, Product product);
//    }
//}