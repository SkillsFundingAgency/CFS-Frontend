using CalculateFunding.Frontend.Core.Ioc;
using CalculateFunding.Frontend.Core.Logging;
using CalculateFunding.Frontend.Interfaces.Core.Logging;
using CalculateFunding.Frontend.Options;
using Microsoft.Extensions.DependencyInjection;

namespace CalculateFunding.Frontend.Modules
{
    public class LoggingModule : ServiceCollectionModuleBase
    {
        override public void Configure(IServiceCollection services)
        {
            AddSettingAsOptions<ApplicationInsightsOptions>(services);

            services
                .AddScoped<ILoggingService, ApplicationInsightsService>();
        }
    }
}
