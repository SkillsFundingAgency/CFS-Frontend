namespace CalculateFunding.Frontend.Modules
{
    using System;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using CalculateFunding.Frontend.Clients;
    using CalculateFunding.Frontend.Clients.CalcsClient;
    using CalculateFunding.Frontend.Clients.DatasetsClient;
    using CalculateFunding.Frontend.Clients.ResultsClient;
    using CalculateFunding.Frontend.Clients.ScenariosClient;
    using CalculateFunding.Frontend.Clients.SpecsClient;
    using CalculateFunding.Frontend.Clients.TestEngineClient;
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.Extensions.DependencyInjection;
    using Polly;

    public class ApiModule : ServiceCollectionModuleBase
    {
        private const string SfaCorellationId = "sfa-correlationId";
        private const string SfaUsernameProperty = "sfa-username";
        private const string SfaUserIdProperty = "sfa-userid";

        private const string OcpApimSubscriptionKey = "Ocp-Apim-Subscription-Key";

        public override void Configure(IServiceCollection services)
        {
            ApiOptions options = AddSettingAsOptions<ApiOptions>(services);

            TimeSpan[] retryTimeSpans = new[] { TimeSpan.FromMilliseconds(500), TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(5) };
            int numberOfExceptionsBeforeCircuitBreaker = 100;
            TimeSpan circuitBreakerFailurePeriod = TimeSpan.FromMinutes(1);

            services.AddHttpClient(HttpClientKeys.Calculations,
                c =>
                {
                    string apiBase = options.CalcsPath ?? "calcs";

                    SetDefaultApiOptions(c, options, apiBase);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Results,
                c =>
                {
                    string apiBase = options.ResultsPath ?? "results";

                    SetDefaultApiOptions(c, options, apiBase);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Specifications,
                c =>
                {
                    string apiBase = options.SpecsPath ?? "specs";

                    SetDefaultApiOptions(c, options, apiBase);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Datasets,
                c =>
                {
                    string apiBase = options.DatasetsPath ?? "datasets";

                    SetDefaultApiOptions(c, options, apiBase);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Scenarios,
                c =>
                {
                    string apiBase = options.ScenariosPath ?? "scenarios";

                    SetDefaultApiOptions(c, options, apiBase);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.TestEngine,
               c =>
               {
                   string apiBase = options.TestEnginePath ?? "tests";

                   SetDefaultApiOptions(c, options, apiBase);
               })
               .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
               .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services
               .AddScoped<ICalculationsApiClient, CalculationsApiClient>();

            services
                .AddScoped<IResultsApiClient, ResultsApiClient>();

            services
               .AddScoped<ISpecsApiClient, SpecsApiClient>();

            services
               .AddScoped<IDatasetsApiClient, DatasetsApiClient>();

            services
                .AddScoped<IScenariosApiClient, ScenariosApiClient>();

            services
               .AddScoped<ITestEngineApiClient, TestEngineApiClient>();
        }

        private static void SetDefaultApiOptions(HttpClient httpClient, ApiOptions options, string apiBase)
        {
            string baseAddress = options.ApiEndpoint;
            if (!baseAddress.EndsWith("/", StringComparison.CurrentCulture))
            {
                baseAddress = $"{baseAddress}/";
            }

            baseAddress += apiBase;

            if (!baseAddress.EndsWith("/", StringComparison.CurrentCulture))
            {
                baseAddress = $"{baseAddress}/";
            }

            httpClient.BaseAddress = new Uri(baseAddress, UriKind.Absolute);
            httpClient.DefaultRequestHeaders?.Add(OcpApimSubscriptionKey, options.ApiKey);
            httpClient.DefaultRequestHeaders?.Add(SfaUsernameProperty, "testuser");
            httpClient.DefaultRequestHeaders?.Add(SfaUserIdProperty, "b001af14-3754-4cb1-9980-359e850700a8");

            httpClient.DefaultRequestHeaders?.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            httpClient.DefaultRequestHeaders?.AcceptEncoding.Add(new StringWithQualityHeaderValue("gzip"));
            httpClient.DefaultRequestHeaders?.AcceptEncoding.Add(new StringWithQualityHeaderValue("deflate"));
        }
    }
}
