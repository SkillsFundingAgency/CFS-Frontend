using System;
using System.Net.Http;
using System.Net.Http.Headers;
using CalculateFunding.Common.ApiClient;
using CalculateFunding.Common.ApiClient.Calcs;
using CalculateFunding.Common.ApiClient.DataSets;
using CalculateFunding.Common.ApiClient.FundingDataZone;
using CalculateFunding.Common.ApiClient.Graph;
using CalculateFunding.Common.ApiClient.Interfaces;
using CalculateFunding.Common.ApiClient.Jobs;
using CalculateFunding.Common.ApiClient.Policies;
using CalculateFunding.Common.ApiClient.Providers;
using CalculateFunding.Common.ApiClient.Publishing;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Users;
using CalculateFunding.Common.Caching;
using CalculateFunding.Common.Config.ApiClient.Profiling;
using CalculateFunding.Common.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.ScenariosClient;
using CalculateFunding.Frontend.Clients.TemplateBuilderClient;
using CalculateFunding.Frontend.Clients.TestEngineClient;
using CalculateFunding.Frontend.Core.Ioc;
using CalculateFunding.Frontend.Interfaces;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Polly;

namespace CalculateFunding.Frontend.Modules
{
	public class ApiModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            TimeSpan[] retryTimeSpans = HostingEnvironment.IsDevelopment() ? 
                new[] { TimeSpan.FromMinutes(10) } :
                new[] { TimeSpan.FromMilliseconds(500), TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(5) };
            int numberOfExceptionsBeforeCircuitBreaker = 100;
            TimeSpan circuitBreakerFailurePeriod = HostingEnvironment.IsDevelopment() ? TimeSpan.FromMinutes(10) : TimeSpan.FromMinutes(1);

            IServiceProvider serviceProvider = services.BuildServiceProvider();

            services.AddHttpClient(HttpClientKeys.Calculations,
                c =>
                {
                    ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("calcsClient");

                    SetDefaultApiClientConfigurationOptions(c, opts, services);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Results,
                c =>
                {
                    ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("resultsClient");

                    SetDefaultApiClientConfigurationOptions(c, opts, services);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Providers,
                c =>
                {
                    ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("providersClient");

                    SetDefaultApiClientConfigurationOptions(c, opts, services);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Policies,
                c =>
                {
                    ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("policiesClient");

                    SetDefaultApiClientConfigurationOptions(c, opts, services);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Specifications,
                c =>
                {
                    ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("specsClient");

                    SetDefaultApiClientConfigurationOptions(c, opts, services);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Datasets,
                c =>
                {
                    ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("datasetsClient");

                    SetDefaultApiClientConfigurationOptions(c, opts, services);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Scenarios,
                c =>
                {
                    ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("scenariosClient");

                    SetDefaultApiClientConfigurationOptions(c, opts, services);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.TestEngine,
               c =>
               {
                   ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("testEngineClient");

                   SetDefaultApiClientConfigurationOptions(c, opts, services);
               })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Users,
             c =>
             {
                 ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("usersClient");

                 SetDefaultApiClientConfigurationOptions(c, opts, services);
             })
             .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
             .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
              .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Jobs,
                c =>
                {
                    ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("jobsClient");

                    SetDefaultApiClientConfigurationOptions(c, opts, services);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));
          
            services.AddHttpClient(HttpClientKeys.Publishing,
                c =>
                {
                    ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("publishingClient");

                    SetDefaultApiClientConfigurationOptions(c, opts, services);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services.AddHttpClient(HttpClientKeys.Graph,
                c =>
                {
                    ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("graphClient");

                    SetDefaultApiClientConfigurationOptions(c, opts, services);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));


            services.AddHttpClient(HttpClientKeys.FDZ,
                c =>
                {
                    ApiClientConfigurationOptions opts = GetConfigurationOptions<ApiClientConfigurationOptions>("fdzClient");

                    SetDefaultApiClientConfigurationOptions(c, opts, services);
                })
                .ConfigurePrimaryHttpMessageHandler(() => new ApiClientHandler())
                .AddTransientHttpErrorPolicy(c => c.WaitAndRetryAsync(retryTimeSpans))
                .AddTransientHttpErrorPolicy(c => c.CircuitBreakerAsync(numberOfExceptionsBeforeCircuitBreaker, circuitBreakerFailurePeriod));

            services
                .AddSingleton<IUserProfileProvider, UserProfileProvider>();

            services
                .AddSingleton<ICacheProvider, StackExchangeRedisClientCacheProvider>();

            services
                .AddSingleton<ICalculationsApiClient, CalculationsApiClient>();

            services
                .AddSingleton<IResultsApiClient, ResultsApiClient>();

            services
                .AddSingleton<IProvidersApiClient, ProvidersApiClient>();
            
            services
                .AddSingleton<IFundingDataZoneApiClient, FundingDataZoneApiClient>();

            services
                .AddSingleton<IPoliciesApiClient, PoliciesApiClient>();

            services
                .AddSingleton<ITemplateBuilderApiClient, TemplateBuilderApiClient>();

            services
               .AddSingleton<IDatasetsApiClient, DatasetsApiClient>();

            services
                .AddSingleton<IScenariosApiClient, ScenariosApiClient>();

            services
               .AddSingleton<ITestEngineApiClient, TestEngineApiClient>();

            services
              .AddSingleton<IUsersApiClient, UsersApiClient>();

            services
                .AddSingleton<IJobsApiClient, JobsApiClient>();

            services.AddSingleton<IPublishingApiClient, PublishingApiClient>();

            services.AddSingleton<ISpecificationsApiClient, SpecificationsApiClient>();

            services.AddSingleton<IGraphApiClient, GraphApiClient>();

            RedisSettings redisSettings = new RedisSettings();

            Configuration.Bind("redisSettings", redisSettings);

            services.AddSingleton(redisSettings);

            services.AddProfilingInterServiceClient(Configuration);
        }

        private static void SetDefaultApiClientConfigurationOptions(HttpClient httpClient, ApiClientConfigurationOptions options, IServiceCollection services)
        {
            Guard.ArgumentNotNull(httpClient, nameof(httpClient));
            Guard.ArgumentNotNull(options, nameof(options));
            Guard.ArgumentNotNull(services, nameof(services));

            if (string.IsNullOrWhiteSpace(options.ApiEndpoint))
            {
                throw new InvalidOperationException("options EndPoint is null or empty string");
            }

            string baseAddress = options.ApiEndpoint;
            if (!baseAddress.EndsWith("/", StringComparison.CurrentCulture))
            {
                baseAddress = $"{baseAddress}/";
            }

            IServiceProvider serviceProvider = services.BuildServiceProvider();

            IUserProfileService userProfileService = serviceProvider.GetService<IUserProfileService>();

            Common.ApiClient.Models.UserProfile userProfile = userProfileService.GetUser();

            httpClient.BaseAddress = new Uri(baseAddress, UriKind.Absolute);
            httpClient.DefaultRequestHeaders?.Add(ApiClientHeaders.ApiKey, options.ApiKey);

            if (string.IsNullOrEmpty(userProfile.Fullname) || string.IsNullOrEmpty(userProfile.Id))
            {
	            httpClient.DefaultRequestHeaders?.Add(ApiClientHeaders.Username, "testuser");
	            httpClient.DefaultRequestHeaders?.Add(ApiClientHeaders.UserId, "testid");

            }
            else
            {
	            httpClient.DefaultRequestHeaders?.Add(ApiClientHeaders.Username, userProfile.Fullname);
	            httpClient.DefaultRequestHeaders?.Add(ApiClientHeaders.UserId, userProfile.Id);

            }

            httpClient.DefaultRequestHeaders?.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            httpClient.DefaultRequestHeaders?.AcceptEncoding.Add(new StringWithQualityHeaderValue("gzip"));
            httpClient.DefaultRequestHeaders?.AcceptEncoding.Add(new StringWithQualityHeaderValue("deflate"));
        }
    }
}
