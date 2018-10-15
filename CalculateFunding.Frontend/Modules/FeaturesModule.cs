using CalculateFunding.Common.FeatureToggles;
using CalculateFunding.Frontend.Core.Ioc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CalculateFunding.Frontend.Modules
{
    public class FeaturesModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            IConfigurationSection featuresConfig = Configuration.GetSection("features");
            IFeatureToggle features = new Features(featuresConfig);
            services.AddSingleton(features);
        }
    }
}
