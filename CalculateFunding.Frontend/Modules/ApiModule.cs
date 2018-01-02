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
            AddSettingAsOptions<AllocationApiOptions>(services);

            services
                .AddScoped<IBudgetApiClient, BudgetApiClient>();

            services
                .AddScoped<IAllocationsApiClient, AllocationsApiClient>();
        }
    }
}
