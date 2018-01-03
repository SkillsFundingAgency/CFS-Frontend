using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.Results;
using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Interfaces.APiClient
{
    public interface IBudgetApiClient
    {
        Task<ApiResponse<IEnumerable<BudgetSummary>>> GetBudgetResults(CancellationToken cancellationToken = default(CancellationToken));

        Task<ApiResponse<Specification>> GetBudget(string id, CancellationToken cancellationToken = default(CancellationToken));

        Task<HttpStatusCode> PostBudget(Specification budget, CancellationToken cancellationToken = default(CancellationToken));

        Task<ApiResponse<IEnumerable<Specification>>> GetBudgets(CancellationToken cancellationToken = default(CancellationToken));
    }
}
