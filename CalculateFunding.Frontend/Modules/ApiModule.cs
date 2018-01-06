using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.Core.Ioc;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.Extensions.DependencyInjection;

namespace CalculateFunding.Frontend.Modules
{
    public class ApiModule : ServiceCollectionModuleBase
    {
        override public void Configure(IServiceCollection services)
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
        }
    }
}
