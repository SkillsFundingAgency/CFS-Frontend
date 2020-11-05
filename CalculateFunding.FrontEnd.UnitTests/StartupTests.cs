using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using CalculateFunding.Frontend.Controllers;
using FluentAssertions;
using Microsoft.ApplicationInsights.AspNetCore.Extensions;
using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using NSubstitute;

namespace CalculateFunding.Frontend.UnitTests
{
    [TestClass]
    public class StartupTests
    {
        [TestMethod]
        public void ConfigureServices_RegisterDependenciesCorrectly()
        {
            // Arrange
            IConfigurationRoot configuration = CreateTestConfiguration();
            IWebHostEnvironment hostingEnv = Substitute.For<IWebHostEnvironment>();
            hostingEnv.EnvironmentName.Returns("Test");

            Startup target = new Startup(configuration, hostingEnv);
            IServiceCollection services = new ServiceCollection();

            var httpContextAccessor = Substitute.For<IHttpContextAccessor>();
            httpContextAccessor.HttpContext = Substitute.For<HttpContext>();

            services.AddScoped(_ => Substitute.For<IHostingEnvironment>());

            services.ReplaceAllRegistrationsWith(Substitute.For<ITelemetry>(), ServiceLifetime.Scoped);
            services.ReplaceAllRegistrationsWith(Substitute.For<ITelemetryInitializer>(), ServiceLifetime.Singleton);
            services.ReplaceAllRegistrationsWith(Substitute.For<IConfigureOptions<ApplicationInsightsServiceOptions>>(), ServiceLifetime.Singleton);

            // Act
            target.ConfigureServices(services);
            services.AddSingleton<IHttpContextAccessor>(httpContextAccessor);

            // Assert
            ServiceProvider serviceProvider = services.BuildServiceProvider();
            ResolveType<CalculationController>(serviceProvider).Should().NotBeNull(nameof(CalculationController));
            ResolveType<CalculationSearchController>(serviceProvider).Should().NotBeNull(nameof(CalculationSearchController));
            ResolveType<DatasetController>(serviceProvider).Should().NotBeNull(nameof(DatasetController));
            ResolveType<DatasetRelationshipsSearchController>(serviceProvider).Should().NotBeNull(nameof(DatasetRelationshipsSearchController));
            ResolveType<DatasetSearchController>(serviceProvider).Should().NotBeNull(nameof(DatasetSearchController));
            ResolveType<DownloadDatasetSchemaController>(serviceProvider).Should().NotBeNull(nameof(DownloadDatasetSchemaController));
            ResolveType<DownloadDatasourceController>(serviceProvider).Should().NotBeNull(nameof(DownloadDatasourceController));
            ResolveType<ProviderSearchController>(serviceProvider).Should().NotBeNull(nameof(ProviderSearchController));
            ResolveType<PublishController>(serviceProvider).Should().NotBeNull(nameof(PublishController));
            ResolveType<ScenarioController>(serviceProvider).Should().NotBeNull(nameof(ScenarioController));
            ResolveType<ScenarioSearchController>(serviceProvider).Should().NotBeNull(nameof(ScenarioSearchController));
            ResolveType<SpecificationController>(serviceProvider).Should().NotBeNull(nameof(SpecificationController));
            ResolveType<SpecificationSearchController>(serviceProvider).Should().NotBeNull(nameof(SpecificationSearchController));
            ResolveType<TestEngineController>(serviceProvider).Should().NotBeNull(nameof(TestEngineController));
            ResolveType<TestScenarioResultController>(serviceProvider).Should().NotBeNull(nameof(TestScenarioResultController));
            ResolveType<TestScenarioSearchController>(serviceProvider).Should().NotBeNull(nameof(TestScenarioSearchController));
            ResolveType<PolicyController>(serviceProvider).Should().NotBeNull(nameof(PolicyController));
            ResolveType<ProviderController>(serviceProvider).Should().NotBeNull(nameof(ProviderController));
            ResolveType<ProfilingController>(serviceProvider).Should().NotBeNull(nameof(ProfilingController));
        }

        protected virtual IConfigurationRoot CreateTestConfiguration()
        {
            var configData = new Dictionary<string, string>
            {
                { "ApplicationInsightsOptions:InstrumentationKey", "test" },
                { "Logging:LogLevel:Default", "Debug" },
                { "Logging:LogLevel:System", "Information" },
                { "Logging:LogLevel:Microsoft", "Information" },
                { "AzureAd:Instance", "https://login.microsoftonline.com/" },
                { "AzureAd:Domain", "azureaddomain.onmicrosoft.com" },
                { "AzureAd:TenantId", "F930E37A-3F4D-4E07-9898-A4D812A781ED" },
                { "AzureAd:ClientId", "4E932B6C-A618-4337-A62B-3542FE9F862E" },
                { "AzureAd:CallbackPath", "/signin-oidc" },
                { "AzureAd:IsEnabled", "true" },
                { "AzureAd:Groups", "FDC440B9-3DF9-40CD-9F33-9690C547E7E8" },
                { "specsClient:ApiEndpoint", "https://localhost:7001/api/specs" },
                { "specsClient:ApiKey", "Local" },
                { "calcsClient:ApiEndpoint", "https://localhost:7002/api/calcs" },
                { "calcsClient:ApiKey", "Local" },
                { "datasetsClient:ApiEndpoint", "https://localhost:7004/api/datasets" },
                { "datasetsClient:ApiKey", "Local" },
                { "resultsClient:ApiEndpoint", "https://localhost:7005/api/results" },
                { "resultsClient:ApiKey", "Local" },
                { "scenariosClient:ApiEndpoint", "https://localhost:7006/api/scenarios" },
                { "scenariosClient:ApiKey", "Local" },
                { "testEngineClient:ApiEndpoint", "https://localhost:7007/api/tests" },
                { "testEngineClient:ApiKey", "Local" },
                { "usersClient:ApiEndpoint", "https://localhost:7008/api/users" },
                { "usersClient:ApiKey", "Local" },
                { "providersClient:ApiEndpoint", "https://localhost:7011/api/providers" },
                { "providersClient:ApiKey", "Local" },
                { "policiesClient:ApiEndpoint", "https://localhost:7013/api/policies" },
                { "policiesClient:ApiKey", "Local" },
                { "publishingClient:ApiEndpoint", "https://localhost:7012/api" },
                { "publishingClient:ApiKey", "Local" },
                { "fdzClient:ApiEndpoint", "https://localhost:7109/api" },
                { "fdzClient:ApiKey", "Local" },
                { "providerProfilingClient:ApiEndpoint", "https://localhost:5001/api"}
            };

            var cb = new ConfigurationBuilder()
                .AddInMemoryCollection(configData);

            return cb.Build();
        }

        /// <summary>
        /// Resolves a type using the type activator cache, just as ASP.NET Core does
        /// </summary>
        /// <typeparam name="T">The type to resolve</typeparam>
        /// <returns>The resolved type, or null if cannot be resolved</returns>
        protected T ResolveType<T>(ServiceProvider serviceProvider)
        {
            var activator = serviceProvider.GetService<IControllerActivator>();

            var actionContext = new ActionContext(
                    new DefaultHttpContext
                    {
                        RequestServices = serviceProvider
                    },
                    new RouteData(),
                    new ControllerActionDescriptor
                    {
                        ControllerTypeInfo = typeof(T).GetTypeInfo()
                    });
            var controller = activator.Create(new ControllerContext(actionContext));

            if (controller.GetType() == typeof(T))
            {
                return (T)controller;
            }

            return default;
        }


    }

    public static class ServiceCollectionExtensions
    {
        public static void ReplaceAllRegistrationsWith<TService>(this IServiceCollection services, TService serviceInstance,
            ServiceLifetime serviceLifetime)
            where TService : class
        {
            ServiceDescriptor mockedServiceDescriptor = new ServiceDescriptor(typeof(TService),
                _ => serviceInstance,
                serviceLifetime);

            ServiceDescriptor[] actualTelemetryServices = services.Where(_ =>
                _.ServiceType == typeof(TService)).ToArray();

            foreach (ServiceDescriptor actualTelemetryService in actualTelemetryServices)
            {
                services.Remove(actualTelemetryService);
            }

            services.Add(mockedServiceDescriptor);
        }
    }
}
