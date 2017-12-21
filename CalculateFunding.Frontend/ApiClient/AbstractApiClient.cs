using System;
using System.Threading.Tasks;
using System.Net;
using Newtonsoft.Json;
using System.Net.Http;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json.Serialization;
using System.Threading;
using CalculateFunding.Frontend.Interfaces.Core;
using CalculateFunding.Frontend.Interfaces.Core.Logging;

namespace CalculateFunding.Frontend.ApiClient
{
    public abstract class AbstractApiClient
    {
        readonly IHttpClient _httpClient;
        readonly JsonSerializerSettings _serializerSettings = new JsonSerializerSettings { Formatting = Formatting.Indented, ContractResolver = new CamelCasePropertyNamesContractResolver() };
        readonly protected string _resultsPath;
        readonly protected string _specsPath;
       readonly ILoggingService _logs;

        public AbstractApiClient(IOptionsSnapshot<AllocationApiOptions> options, IHttpClient httpClient, ILoggingService logs)
        {
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", options.Value.ApiKey);
            _resultsPath = options.Value.ResultsPath ?? "/api/results";
            _specsPath = options.Value.SpecsPath ?? "/api/specs";
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _logs = logs;
        }

        async public Task<ApiResponse<T>> GetAsync<T>(string url, CancellationToken cancellationToken = default(CancellationToken))
        {
            _logs.Trace($"Beginning to fetch data from: {url}");

            var response = await _httpClient.GetAsync(url, cancellationToken).ConfigureAwait(false);
            if (response.IsSuccessStatusCode)
            {
                return new ApiResponse<T>(response.StatusCode, JsonConvert.DeserializeObject<T>(await response.Content.ReadAsStringAsync().ConfigureAwait(false), _serializerSettings));
            }
            return new ApiResponse<T>(response.StatusCode);
        }

        async public Task<ApiResponse<TResponse>> PostAsync<TResponse, TRequest>(string url, TRequest request, CancellationToken cancellationToken = default(CancellationToken))
        {
            var json = JsonConvert.SerializeObject(request, _serializerSettings);
            var response = await _httpClient.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"), cancellationToken ).ConfigureAwait(false);
            if (response.IsSuccessStatusCode)
            {
                return new ApiResponse<TResponse>(response.StatusCode, JsonConvert.DeserializeObject<TResponse>(await response.Content.ReadAsStringAsync().ConfigureAwait(false), _serializerSettings));
            }
            return new ApiResponse<TResponse>(response.StatusCode);
        }

        async public Task<HttpStatusCode> PostAsync<TRequest>(string url, TRequest request, CancellationToken cancellationToken = default(CancellationToken))
        {
            string json = JsonConvert.SerializeObject(request, _serializerSettings);
            var response = await _httpClient.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"), cancellationToken).ConfigureAwait(false);
            return response.StatusCode;
        }
    }
}
