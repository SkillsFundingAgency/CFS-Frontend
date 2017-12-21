using CalculateFunding.Frontend.Core.Ioc;
using CalculateFunding.Frontend.Core.Proxies;
using CalculateFunding.Frontend.Interfaces.Core;
using Microsoft.Extensions.DependencyInjection;

namespace CalculateFunding.Frontend.Modules
{
    public class ProxiesModule : ServiceCollectionModuleBase
    {
        override public void Configure(IServiceCollection services)
        {
            services
                .AddTransient<IHttpClient, HttpClientProxy>();
        }
    }
}
