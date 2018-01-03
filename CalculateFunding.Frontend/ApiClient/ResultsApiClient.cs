using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.Results;
using CalculateFunding.Frontend.Interfaces.APiClient;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

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

        public Task<ApiResponse<BudgetSummary[]>> GetBudgetResults()
        {
            return GetAsync<BudgetSummary[]>($"{_resultsPath}/budgets");
        }

        public Task<ApiResponse<ProviderTestResult[]>> GetProviderResults(string budgetId)
        {
            return GetAsync<ProviderTestResult[]>($"{_resultsPath}/providers?budgetId={budgetId}");
        }

        public Task<ApiResponse<ProviderTestResult>> GetProviderResult(string budgetId, string providerId)
        {
            return GetAsync<ProviderTestResult>($"{_resultsPath}/providers?budgetId={budgetId}&providerId={providerId}");
        }

        public Task<ApiResponse<AllocationLine>> GetAllocationLine(string budgetId, string allocationLineId)
        {
            return GetAsync<AllocationLine>($"{_resultsPath}/allocationLine?budgetId={budgetId}&allocationLineId={allocationLineId}");
        }
    }
}

