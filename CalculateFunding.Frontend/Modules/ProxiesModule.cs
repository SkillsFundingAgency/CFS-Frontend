namespace CalculateFunding.Frontend.Modules
{
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.Core.Proxies;
    using CalculateFunding.Frontend.Interfaces.Core;
    using Microsoft.Extensions.DependencyInjection;

    public class ProxiesModule : ServiceCollectionModuleBase
    {
        public override void Configure(IServiceCollection services)
        {
            services
                .AddTransient<IHttpClient, HttpClientProxy>();
        }
    }
}
