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
using CalculateFunding.Frontend.Helpers;

namespace CalculateFunding.Frontend.ApiClient
{
    public abstract class AbstractApiClient
    {
        const string sfaCorellationId = "sfa-correlationId";
        const string ocpApimSubscriptionKey = "Ocp-Apim-Subscription-Key";

        readonly IHttpClient _httpClient;
        readonly JsonSerializerSettings _serializerSettings = new JsonSerializerSettings { Formatting = Formatting.Indented, ContractResolver = new CamelCasePropertyNamesContractResolver() };
        readonly protected ILoggingService _logs;

        public AbstractApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILoggingService logs)
        {
            Guard.ArgumentNotNull(options, nameof(options));
            Guard.ArgumentNotNull(httpClient, nameof(httpClient));
            Guard.ArgumentNotNull(logs, nameof(logs));

            _logs = logs;
            _httpClient = httpClient;
            string baseAddress = options.Value.ApiEndpoint;
            if (!baseAddress.EndsWith("/"))
            {
                baseAddress = $"{baseAddress}/";
            }
            _httpClient.BaseAddress = new Uri(baseAddress, UriKind.Absolute);
            _httpClient.DefaultRequestHeaders?.Add(ocpApimSubscriptionKey, options.Value.ApiKey);
            _httpClient.DefaultRequestHeaders?.Add(sfaCorellationId, _logs.CorrelationId);
            _httpClient.DefaultRequestHeaders?.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.DefaultRequestHeaders?.AcceptEncoding.Add(new StringWithQualityHeaderValue("gzip"));
            _httpClient.DefaultRequestHeaders?.AcceptEncoding.Add(new StringWithQualityHeaderValue("deflate"));
        }

        async public Task<ApiResponse<T>> GetAsync<T>(string url, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url));
            }

            _logs.Trace($"Beginning to fetch data from: {url}");

            HttpResponseMessage response = null;

            response = await _httpClient.GetAsync(url, cancellationToken).ConfigureAwait(false);
            if (response == null)
            {
                throw new HttpRequestException($"Unable to connect to server. Url={_httpClient.BaseAddress.AbsoluteUri}{url}");

            }

            if (response.IsSuccessStatusCode)
            {
                return new ApiResponse<T>(response.StatusCode, JsonConvert.DeserializeObject<T>(await response.Content.ReadAsStringAsync().ConfigureAwait(false), _serializerSettings));
            }

            _logs.Trace($"No successful response from {url} with status code: {response.StatusCode} and reason: {response.ReasonPhrase}");

            return new ApiResponse<T>(response.StatusCode);


        }

        async public Task<ApiResponse<TResponse>> PostAsync<TResponse, TRequest>(string url, TRequest request, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url));
            }

            var json = JsonConvert.SerializeObject(request, _serializerSettings);
            var response = await _httpClient.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"), cancellationToken).ConfigureAwait(false);
            if (response.IsSuccessStatusCode)
            {
                return new ApiResponse<TResponse>(response.StatusCode, JsonConvert.DeserializeObject<TResponse>(await response.Content.ReadAsStringAsync().ConfigureAwait(false), _serializerSettings));
            }
            return new ApiResponse<TResponse>(response.StatusCode);
        }

        async public Task<HttpStatusCode> PostAsync<TRequest>(string url, TRequest request, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url));
            }

            string json = JsonConvert.SerializeObject(request, _serializerSettings);
            var response = await _httpClient.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"), cancellationToken).ConfigureAwait(false);
            return response.StatusCode;
        }
    }
}
