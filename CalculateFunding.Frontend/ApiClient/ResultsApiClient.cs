using System.Threading;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.Results;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;

namespace CalculateFunding.Frontend.ApiClient
{
    public class ResultsApiClient : AbstractApiClient, IResultsApiClient
    {
        private readonly string _resultsPath;

        public ResultsApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILoggingService logs)
            : base(options, httpClient, logs)
        {
            _resultsPath = options.Value.ResultsPath ?? "/api/results";

        }

        public Task<ApiResponse<BudgetSummary[]>> GetBudgetResults(CancellationToken cancellationToken = default(CancellationToken))
        {
            return GetAsync<BudgetSummary[]>($"{_resultsPath}/budgets", cancellationToken);
        }

        public Task<ApiResponse<ProviderTestResult[]>> GetProviderResults(string budgetId, CancellationToken cancellationToken = default(CancellationToken))
        {
            return GetAsync<ProviderTestResult[]>($"{_resultsPath}/providers?budgetId={budgetId}", cancellationToken);
        }

        public Task<ApiResponse<ProviderTestResult>> GetProviderResult(string budgetId, string providerId, CancellationToken cancellationToken = default(CancellationToken))
        {
            return GetAsync<ProviderTestResult>($"{_resultsPath}/providers?budgetId={budgetId}&providerId={providerId}", cancellationToken);
        }

        public Task<ApiResponse<AllocationLine>> GetAllocationLine(string budgetId, string allocationLineId, CancellationToken cancellationToken = default(CancellationToken))
        {
            return GetAsync<AllocationLine>($"{_resultsPath}/allocationLine?budgetId={budgetId}&allocationLineId={allocationLineId}", cancellationToken);
        }
    }
}

