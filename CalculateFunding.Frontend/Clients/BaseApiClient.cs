namespace CalculateFunding.Frontend.Clients
{
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Net.Http;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.CommonModels;
    using CalculateFunding.Frontend.Helpers;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Serialization;
    using Serilog;

    public abstract class BaseApiClient
    {
        private readonly ILogger _logger;
        private readonly string _clientKey;

        private readonly HttpClient _httpClient;
        private readonly JsonSerializerSettings _serializerSettings = new JsonSerializerSettings { Formatting = Formatting.Indented, ContractResolver = new CamelCasePropertyNamesContractResolver() };

        public BaseApiClient(IHttpClientFactory httpClientFactory, string clientKey, ILogger logger)
        {
            Guard.ArgumentNotNull(httpClientFactory, nameof(httpClientFactory));
            Guard.IsNullOrWhiteSpace(clientKey, nameof(clientKey));
            Guard.ArgumentNotNull(logger, nameof(logger));

            _httpClient = httpClientFactory.CreateClient(clientKey);

            _clientKey = clientKey;
            _logger = logger;

            _logger.Debug("AbstractApiClient created with Client Key: {clientkey} with base address: {baseAddress}", clientKey, _httpClient.BaseAddress);
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
            _logger.Debug("ApiClient GET: {clientKey}://{url}", _clientKey, url);

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
            _logger.Debug($"ApiClient POST: {{clientKey}}://{{url}} ({typeof(TRequest).Name} => {typeof(TResponse).Name})", _clientKey, url);
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
            _logger.Debug($"ApiClient Validated POST: {{clientKey}}://{{url}} ({typeof(TRequest).Name} => {typeof(TResponse).Name})", _clientKey, url);
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
            _logger.Debug($"ApiClient POST: {{clientKey}}://{{url}} ({typeof(TRequest).Name})", _clientKey, url);
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


            _logger.Debug($"ApiClient POST: {{clientKey}}://{{url}}", _clientKey, url);
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
            _logger.Debug($"ApiClient PUT: {{clientKey}}://{{url}} ({typeof(TRequest).Name})", _clientKey, url);
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
            _logger.Debug($"ApiClient Validated POST: {{clientKey}}://{{url}} ({typeof(TRequest).Name} => {typeof(TResponse).Name})", _clientKey, url);
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
