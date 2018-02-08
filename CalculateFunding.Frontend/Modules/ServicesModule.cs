namespace CalculateFunding.Frontend.Modules
{
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.Services;
    using Microsoft.Extensions.DependencyInjection;

    public class ServicesModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            services.AddScoped<ICalculationSearchService, CalculationSearchService>();
            services.AddScoped<IDatasetSearchService, DatasetSearchService>();
        }
    }
}
