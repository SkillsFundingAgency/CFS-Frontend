using System.Threading;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;
using Serilog;

namespace CalculateFunding.Frontend.Clients.ResultsClient
{
    public class ResultsApiClient : AbstractApiClient, IResultsApiClient
    {
        private readonly string _resultsPath;

        public ResultsApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILogger logger, ICorrelationIdProvider correlationIdProvider)
            : base(options, httpClient, logger, correlationIdProvider)
        {
            _resultsPath = options.Value.ResultsPath ?? "/api/results";

        }

        public Task<ApiResponse<BudgetSummary[]>> GetBudgetResults(CancellationToken cancellationToken = default(CancellationToken))
        {
            return GetAsync<BudgetSummary[]>($"{_resultsPath}/budgets", cancellationToken);
        }

        public Task<ApiResponse<ProviderTestResult[]>> GetProviderResults(string budgetId, CancellationToken cancellationToken = default(CancellationToken))
        {
            Guard.IsNullOrWhiteSpace(budgetId, nameof(budgetId));

            return GetAsync<ProviderTestResult[]>($"{_resultsPath}/providers?budgetId={budgetId}", cancellationToken);
        }

        public Task<ApiResponse<ProviderTestResult>> GetProviderResult(string budgetId, string providerId, CancellationToken cancellationToken = default(CancellationToken))
        {
            Guard.IsNullOrWhiteSpace(budgetId, nameof(budgetId));
            Guard.IsNullOrWhiteSpace(providerId, nameof(providerId));

            return GetAsync<ProviderTestResult>($"{_resultsPath}/providers?budgetId={budgetId}&providerId={providerId}", cancellationToken);
        }

        public Task<ApiResponse<AllocationLine>> GetAllocationLine(string budgetId, string allocationLineId, CancellationToken cancellationToken = default(CancellationToken))
        {
            Guard.IsNullOrWhiteSpace(budgetId, nameof(budgetId));
            Guard.IsNullOrWhiteSpace(allocationLineId, nameof(allocationLineId));

            return GetAsync<AllocationLine>($"{_resultsPath}/allocationLine?budgetId={budgetId}&allocationLineId={allocationLineId}", cancellationToken);
        }
    }
}

