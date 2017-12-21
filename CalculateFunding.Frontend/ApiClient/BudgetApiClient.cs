using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.Results;
using CalculateFunding.Frontend.Interfaces.APiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.ApiClient
{
    public class BudgetApiClient : AbstractApiClient, IBudgetApiClient
    {
        public BudgetApiClient(IOptionsSnapshot<AllocationApiOptions> options, IHttpClient httpClient, ILoggingService logs) 
            : base(options, httpClient, logs)
        { }

        public Task<ApiResponse<IEnumerable<BudgetSummary>>> GetBudgetResultsAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            return GetAsync<IEnumerable<BudgetSummary>>($"{_resultsPath}/budgets", cancellationToken);
        }

        public Task<ApiResponse<Specification>> GetBudgetAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            return GetAsync<Specification>($"{_specsPath}/budgets?budgetId={id}", cancellationToken);
        }

        public Task<HttpStatusCode> PostBudgetAsync(Specification budget, CancellationToken cancellationToken = default(CancellationToken))
        {
            return PostAsync($"{_specsPath}/budgets", budget, cancellationToken);
        }

        public Task<ApiResponse<IEnumerable<Specification>>> GetBudgetsAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            return GetAsync<IEnumerable<Specification>>($"{_specsPath}/budgets", cancellationToken);
        }
    }
}
