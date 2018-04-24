namespace CalculateFunding.Frontend.Modules
{
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.Interfaces.Services;
    using CalculateFunding.Frontend.Services;
    using Microsoft.Extensions.DependencyInjection;

    public class ServicesModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            services.AddScoped<ICalculationSearchService, CalculationSearchService>();
            services.AddScoped<IDatasetSearchService, DatasetSearchService>();
            services.AddScoped<IProviderSearchService, ProviderSearchService>();
            services.AddScoped<IDatasetRelationshipsSearchService, DatasetRelationshipsSearchService>();
            services.AddScoped<IScenarioSearchService, ScenarioSearchService>();
            services.AddScoped<ITestResultsSearchService, TestResultsSearchService>();
        }
    }
}
