using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.Core.Ioc;
using CalculateFunding.Frontend.Interfaces.APiClient;
using Microsoft.Extensions.DependencyInjection;

namespace CalculateFunding.Frontend.Modules
{
    public class ApiModule : ServiceCollectionModuleBase
    {
        override public void Configure(IServiceCollection services)
        {
            AddSettingAsOptions<ApiOptions>(services);

            services
                .AddScoped<IBudgetApiClient, BudgetApiClient>();

            services
                .AddScoped<ISpecsApiClient, SpecsApiClient>();

            services
                .AddScoped<ICalculationsApiClient, CalculationsApiClient>();

            services
                .AddScoped<IResultsApiClient, ResultsApiClient>();
        }
    }
}
