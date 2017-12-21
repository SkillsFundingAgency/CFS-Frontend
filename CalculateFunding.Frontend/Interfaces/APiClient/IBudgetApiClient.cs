using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.Results;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Interfaces.APiClient
{
    public interface IBudgetApiClient
    {
        Task<ApiResponse<IEnumerable<BudgetSummary>>> GetBudgetResultsAsync(CancellationToken cancellationToken = default(CancellationToken));

        Task<ApiResponse<Specification>> GetBudgetAsync(string id, CancellationToken cancellationToken = default(CancellationToken));

        Task<HttpStatusCode> PostBudgetAsync(Specification budget, CancellationToken cancellationToken = default(CancellationToken));

        Task<ApiResponse<IEnumerable<Specification>>> GetBudgetsAsync(CancellationToken cancellationToken = default(CancellationToken));
    }
}
