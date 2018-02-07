using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CalculateFunding.Frontend.Core.Ioc
{
    abstract public class ServiceCollectionModuleBase
    {
        public IConfiguration Configuration { get; set; }

        abstract public void Configure(IServiceCollection services);

        protected T AddSettingAsOptions<T>(IServiceCollection services)
            where T : class, new()
        {
            return services.AddOptions<T>(Configuration);
        }
    }
}
