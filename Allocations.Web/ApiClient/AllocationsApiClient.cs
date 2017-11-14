using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Allocations.Web.ApiClient.Models;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Allocations.Web.ApiClient
{
    public class AllocationApiOptions
    {
        public string AllocationsApiKey { get; set; }
        public string AllocationsApiEndpoint { get; set; }
    }
    public class AllocationsApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly JsonSerializerSettings _serializerSettings = new JsonSerializerSettings{Formatting = Formatting.Indented, ContractResolver = new CamelCasePropertyNamesContractResolver()};

        public AllocationsApiClient(IOptions<AllocationApiOptions> options)
        {
            _httpClient = new HttpClient(){BaseAddress = new Uri(options.Value.AllocationsApiEndpoint)};
            _httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", options.Value.AllocationsApiKey);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<ApiResponse<T>> GetAsync<T>(string url)
        {
            var response = await _httpClient.GetAsync(url);
            if (response.IsSuccessStatusCode)
            {
                return new ApiResponse<T>(response.StatusCode, JsonConvert.DeserializeObject<T>(await response.Content.ReadAsStringAsync(), _serializerSettings));
            }
            return new ApiResponse<T>(response.StatusCode);
        }

        public async Task<ApiResponse<Budget>> GetBudget(string id)
        {
            return await GetAsync<Budget>($"api/v1/specs/budgets?budgetId={id}");
        }

        public async Task<ApiResponse<Budget[]>> GetBudgets()
        {
            return await GetAsync<Budget[]>($"api/v1/specs/budgets");
        }

        public async Task<ApiResponse<TResponse>> PostAsync<TResponse, TRequest>(string url, TRequest request)
        {
            string json = JsonConvert.SerializeObject(request, _serializerSettings);
            var response = await _httpClient.PostAsync(url, new StringContent(json));
            if (response.IsSuccessStatusCode)
            {
                return new ApiResponse<TResponse>(response.StatusCode, JsonConvert.DeserializeObject<TResponse>(await response.Content.ReadAsStringAsync(), _serializerSettings));
            }
            return new ApiResponse<TResponse>(response.StatusCode);
        }
    }
}
