using CalculateFunding.Frontend.Core.Ioc;
using CalculateFunding.Frontend.Services;
using Microsoft.Extensions.DependencyInjection;

namespace CalculateFunding.Frontend.Modules
{
    public class ServicesModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            services.AddScoped<ICalculationSearchService, CalculationSearchService>();
        }
    }
}
