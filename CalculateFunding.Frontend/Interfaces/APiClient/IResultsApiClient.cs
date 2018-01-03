using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.Results;

namespace CalculateFunding.Frontend.Interfaces.ApiClient
{
    public interface IResultsApiClient
    {
        Task<ApiResponse<AllocationLine>> GetAllocationLine(string budgetId, string allocationLineId);
        Task<ApiResponse<BudgetSummary[]>> GetBudgetResults();
        Task<ApiResponse<ProviderTestResult>> GetProviderResult(string budgetId, string providerId);
        Task<ApiResponse<ProviderTestResult[]>> GetProviderResults(string budgetId);
    }
}