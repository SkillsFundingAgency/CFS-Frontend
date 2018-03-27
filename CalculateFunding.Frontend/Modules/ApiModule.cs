namespace CalculateFunding.Frontend.Modules
{
    using CalculateFunding.Frontend.Clients;
    using CalculateFunding.Frontend.Clients.CalcsClient;
    using CalculateFunding.Frontend.Clients.DatasetsClient;
    using CalculateFunding.Frontend.Clients.PreviewClient;
    using CalculateFunding.Frontend.Clients.ResultsClient;
    using CalculateFunding.Frontend.Clients.SpecsClient;
    using CalculateFunding.Frontend.Clients.ScenariosClient;
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.Extensions.DependencyInjection;
    using CalculateFunding.Frontend.Clients.TestEngineClient;

    public class ApiModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            AddSettingAsOptions<ApiOptions>(services);

            services
               .AddScoped<ICalculationsApiClient, CalculationsApiClient>();

            services
               .AddScoped<IPreviewApiClient, PreviewApiClient>();

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
    }
}
