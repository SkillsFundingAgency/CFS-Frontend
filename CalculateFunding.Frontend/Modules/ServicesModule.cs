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
            services.AddScoped<IDatasetDefinitionSearchService, DatasetDefinitionSearchService>();
            services.AddScoped<IProviderSearchService, ProviderSearchService>();
            services.AddScoped<IDatasetRelationshipsSearchService, DatasetRelationshipsSearchService>();
            services.AddScoped<IScenarioSearchService, ScenarioSearchService>();
            services.AddScoped<ITestScenarioSearchService, TestScenarioSearchService>();
            services.AddScoped<ITestResultsSearchService, TestResultsSearchService>();
            services.AddScoped<ITestScenarioResultsService, TestScenarioResultsService>();
            services.AddScoped<ICalculationProviderResultsSearchService, CalculationProviderResultsSearchService>();
            services.AddScoped<ISpecificationSearchService, SpecificationSearchService>();
            services.AddScoped<IUserProfileService, UserProfileService>();
            services.AddScoped<IUserSearchService, UserSearchService>();
            services.AddScoped<ITemplateMetadataContentsAssemblerService, TemplateMetadataContentsAssemblerService>();
            services.AddScoped<IPublishedProviderSearchService, PublishedProviderSearchService>();
            services.AddScoped<IGraphCalculationService, GraphCalculationService>();
        }
    }
}
