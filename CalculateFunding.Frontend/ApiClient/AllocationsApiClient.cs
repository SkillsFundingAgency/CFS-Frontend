using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.Results;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace CalculateFunding.Frontend.ApiClient
{
    public class AllocationsApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly JsonSerializerSettings _serializerSettings = new JsonSerializerSettings{Formatting = Formatting.Indented, ContractResolver = new CamelCasePropertyNamesContractResolver()};
        private readonly string _resultsPath;
        private string _specsPath;
        
        public AllocationsApiClient(IOptions<AllocationApiOptions> options)
        {
            _httpClient = new HttpClient(){BaseAddress = new Uri(options.Value.ApiEndpoint)};
            _httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", options.Value.ApiKey);
            _resultsPath = options.Value.ResultsPath ?? "/api/results";
            _specsPath = options.Value.SpecsPath ?? "/api/specs";
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<ApiResponse<T>> GetAsync<T>(string url)
        {
            var response = await _httpClient.GetAsync(url).ConfigureAwait(false);
            if (response.IsSuccessStatusCode)
            {
                return new ApiResponse<T>(response.StatusCode, JsonConvert.DeserializeObject<T>(await response.Content.ReadAsStringAsync().ConfigureAwait(false), _serializerSettings));
            }
            return new ApiResponse<T>(response.StatusCode);
        }

        public Task<ApiResponse<BudgetSummary[]>> GetBudgetResults()
        {
            return GetAsync<BudgetSummary[]>($"{_resultsPath}/budgets");
        }

        public Task<ApiResponse<List<Specification>>> GetSpecifications()
        {
            return GetAsync<List<Specification>>($"{_specsPath}/specifications");
        }

        public Task<ApiResponse<Specification>> GetBudget(string id)
        {
            return GetAsync<Specification>($"{_specsPath}/budgets?budgetId={id}");
        }

        public Task<ApiResponse<ProviderTestResult[]>> GetProviderResults(string budgetId)
        {
            return GetAsync<ProviderTestResult[]>($"{_resultsPath}/providers?budgetId={budgetId}");
        }

        public Task<ApiResponse<ProviderTestResult>> GetProviderResult(string budgetId, string providerId)
        {
            return GetAsync<ProviderTestResult>($"{_resultsPath}/providers?budgetId={budgetId}&providerId={providerId}");
        }

        public Task<HttpStatusCode> PostBudget(Specification budget)
        {
            return PostAsync($"{_specsPath}/budgets", budget);
        }

        public Task<HttpStatusCode> PostProduct(string budgetId, Product product)
        {
            return PostAsync($"{_specsPath}/products?budgetId={budgetId}", product);
        }

        public Task<ApiResponse<Product>> GetProduct(string budgetId, string productId)
        {
            return GetAsync<Product>($"{_specsPath}/products?budgetId={budgetId}&productId={productId}");
        }

        public Task<ApiResponse<AllocationLine>> GetAllocationLine(string budgetId, string allocationLineId)
        {
            return GetAsync<AllocationLine>($"{_resultsPath}/allocationLine?budgetId={budgetId}&allocationLineId={allocationLineId}");
        }


        public Task<ApiResponse<Specification[]>> GetBudgets()
        {
            return GetAsync<Specification[]>($"{_specsPath}/budgets");
        }

        public async Task<ApiResponse<PreviewResponse>> PostPreview(PreviewRequest request)
        {

            return (await PostAsync<PreviewResponse, PreviewRequest>("api/v1/engine/preview", request).ConfigureAwait(false));
        }


        private async Task<ApiResponse<TResponse>> PostAsync<TResponse, TRequest>(string url, TRequest request)
        {
            string json = JsonConvert.SerializeObject(request, _serializerSettings);
            var response = await _httpClient.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json")).ConfigureAwait(false);
            if (response.IsSuccessStatusCode)
            {
                return new ApiResponse<TResponse>(response.StatusCode, JsonConvert.DeserializeObject<TResponse>(await response.Content.ReadAsStringAsync().ConfigureAwait(false), _serializerSettings));
            }
            return new ApiResponse<TResponse>(response.StatusCode);
        }

        private async Task<HttpStatusCode> PostAsync<TRequest>(string url, TRequest request)
        {
            string json = JsonConvert.SerializeObject(request, _serializerSettings);
            var response = await _httpClient.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json")).ConfigureAwait(false);
            return response.StatusCode;
        }

    }
}

