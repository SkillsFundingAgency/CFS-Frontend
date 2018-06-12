namespace CalculateFunding.Frontend.Clients
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using CalculateFunding.Frontend.Interfaces.Core;
    using CalculateFunding.Frontend.Interfaces.Core.Logging;
    using Microsoft.Extensions.Options;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Serialization;
    using Serilog;

    public abstract class AbstractApiClient
    {
        private const string SfaCorellationId = "sfa-correlationId";
        private const string SfaUsernameProperty = "sfa-username";
        private const string SfaUserIdProperty = "sfa-userid";

        private const string OcpApimSubscriptionKey = "Ocp-Apim-Subscription-Key";

        private readonly ILogger _logger;

        private readonly IHttpClient _httpClient;
        private readonly JsonSerializerSettings _serializerSettings = new JsonSerializerSettings { Formatting = Formatting.Indented, ContractResolver = new CamelCasePropertyNamesContractResolver() };
        private readonly ICorrelationIdProvider _correlationIdProvider;

        public AbstractApiClient(IOptionsSnapshot<ApiOptions> options, IHttpClient httpClient, ILogger logger, ICorrelationIdProvider correlationIdProvider)
        {
            Guard.ArgumentNotNull(options, nameof(options));
            Guard.ArgumentNotNull(httpClient, nameof(httpClient));
            Guard.ArgumentNotNull(httpClient, nameof(logger));
            Guard.ArgumentNotNull(httpClient, nameof(correlationIdProvider));

            _correlationIdProvider = correlationIdProvider;

            _httpClient = httpClient;
            string baseAddress = options.Value.ApiEndpoint;
            if (!baseAddress.EndsWith("/", StringComparison.CurrentCulture))
            {
                baseAddress = $"{baseAddress}/";
            }

            _httpClient.BaseAddress = new Uri(baseAddress, UriKind.Absolute);
            _httpClient.DefaultRequestHeaders?.Add(OcpApimSubscriptionKey, options.Value.ApiKey);
            _httpClient.DefaultRequestHeaders?.Add(SfaCorellationId, _correlationIdProvider.GetCorrelationId());
            _httpClient.DefaultRequestHeaders?.Add(SfaUsernameProperty, "testuser");
            _httpClient.DefaultRequestHeaders?.Add(SfaUserIdProperty, "b001af14-3754-4cb1-9980-359e850700a8");

            _httpClient.DefaultRequestHeaders?.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            _httpClient.DefaultRequestHeaders?.AcceptEncoding.Add(new StringWithQualityHeaderValue("gzip"));
            _httpClient.DefaultRequestHeaders?.AcceptEncoding.Add(new StringWithQualityHeaderValue("deflate"));

            _logger = logger;

            _logger.Debug("AbstractApiClient created with Base URL: {baseAddress}", baseAddress);
        }

        protected ILogger Logger
        {
            get
            {
                return _logger;
            }
        }

        public async Task<ApiResponse<T>> GetAsync<T>(string url, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url));
            }

            HttpResponseMessage response = null;
            _logger.Debug("ApiClient GET: {url}", url);

            response = await _httpClient.GetAsync(url, cancellationToken);
            if (response == null)
            {
                throw new HttpRequestException($"Unable to connect to server. Url={_httpClient.BaseAddress.AbsoluteUri}{url}");
            }

            if (response.IsSuccessStatusCode)
            {
                string bodyContent = await response.Content.ReadAsStringAsync();
                return new ApiResponse<T>(response.StatusCode, JsonConvert.DeserializeObject<T>(bodyContent, _serializerSettings));
            }

            return new ApiResponse<T>(response.StatusCode);
        }

        public async Task<ApiResponse<TResponse>> PostAsync<TResponse, TRequest>(string url, TRequest request, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url));
            }

            var json = JsonConvert.SerializeObject(request, _serializerSettings);
            _logger.Debug($"ApiClient POST: {{url}} ({typeof(TRequest).Name} => {typeof(TResponse).Name})", url);
            var response = await _httpClient.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"), cancellationToken);
            if (response == null)
            {
                throw new HttpRequestException($"Unable to connect to server. Url={_httpClient.BaseAddress.AbsoluteUri}{url}");
            }

            if (response.IsSuccessStatusCode)
            {
                string responseBody = await response.Content.ReadAsStringAsync();
                return new ApiResponse<TResponse>(response.StatusCode, JsonConvert.DeserializeObject<TResponse>(responseBody, _serializerSettings));
            }

            return new ApiResponse<TResponse>(response.StatusCode);
        }

        public async Task<ValidatedApiResponse<TResponse>> ValidatedPostAsync<TResponse, TRequest>(string url, TRequest request, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url));
            }

            string json = JsonConvert.SerializeObject(request, _serializerSettings);
            _logger.Debug($"ApiClient Validated POST: {{url}} ({typeof(TRequest).Name} => {typeof(TResponse).Name})", url);
            var response = await _httpClient.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"), cancellationToken);
            if (response == null)
            {
                throw new HttpRequestException($"Unable to connect to server. Url={_httpClient.BaseAddress.AbsoluteUri}{url}");
            }

            if (response.IsSuccessStatusCode)
            {
                return new ValidatedApiResponse<TResponse>(response.StatusCode, JsonConvert.DeserializeObject<TResponse>(await response.Content.ReadAsStringAsync(), _serializerSettings));
            }

            ValidatedApiResponse<TResponse> apiResponse = new ValidatedApiResponse<TResponse>(response.StatusCode);

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                apiResponse.ModelState = JsonConvert.DeserializeObject<IDictionary<string, IEnumerable<string>>>(await response.Content.ReadAsStringAsync(), _serializerSettings);

            }

            return apiResponse;
        }

        public async Task<HttpStatusCode> PostAsync<TRequest>(string url, TRequest request, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url));
            }

            string json = JsonConvert.SerializeObject(request, _serializerSettings);
            _logger.Debug($"ApiClient POST: {{url}} ({typeof(TRequest).Name})", url);
            var response = await _httpClient.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"), cancellationToken);
            if (response == null)
            {
                throw new HttpRequestException($"Unable to connect to server. Url={_httpClient.BaseAddress.AbsoluteUri}{url}");
            }

            return response.StatusCode;
        }

        public async Task<HttpStatusCode> PostAsync(string url, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url));
            }

          
            _logger.Debug($"ApiClient POST: {{url}}", url);
            var response = await _httpClient.PostAsync(url, null, cancellationToken);
            if (response == null)
            {
                throw new HttpRequestException($"Unable to connect to server. Url={_httpClient.BaseAddress.AbsoluteUri}{url}");
            }

            return response.StatusCode;
        }

        public async Task<HttpStatusCode> PutAsync<TRequest>(string url, TRequest request, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url));
            }

            string json = JsonConvert.SerializeObject(request, _serializerSettings);
            _logger.Debug($"ApiClient PUT: {{url}} ({typeof(TRequest).Name})", url);
            var response = await _httpClient.PutAsync(url, new StringContent(json, Encoding.UTF8, "application/json"), cancellationToken);
            if (response == null)
            {
                throw new HttpRequestException($"Unable to connect to server. Url={_httpClient.BaseAddress.AbsoluteUri}{url}");
            }

            return response.StatusCode;
        }

        public async Task<ValidatedApiResponse<TResponse>> ValidatedPutAsync<TResponse, TRequest>(string url, TRequest request, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (url == null)
            {
                throw new ArgumentNullException(nameof(url));
            }

            var json = JsonConvert.SerializeObject(request, _serializerSettings);
            _logger.Debug($"ApiClient Validated POST: {{url}} ({typeof(TRequest).Name} => {typeof(TResponse).Name})", url);
            var response = await _httpClient.PutAsync(url, new StringContent(json, Encoding.UTF8, "application/json"), cancellationToken);
            if (response == null)
            {
                throw new HttpRequestException($"Unable to connect to server. Url={_httpClient.BaseAddress.AbsoluteUri}{url}");
            }

            if (response.IsSuccessStatusCode)
            {
                return new ValidatedApiResponse<TResponse>(response.StatusCode, JsonConvert.DeserializeObject<TResponse>(await response.Content.ReadAsStringAsync(), _serializerSettings));
            }

            ValidatedApiResponse<TResponse> apiResponse = new ValidatedApiResponse<TResponse>(response.StatusCode);

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                apiResponse.ModelState = JsonConvert.DeserializeObject<IDictionary<string, IEnumerable<string>>>(await response.Content.ReadAsStringAsync(), _serializerSettings);
            }

            return apiResponse;
        }
    }
}
