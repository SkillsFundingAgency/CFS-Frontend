namespace CalculateFunding.Frontend.Core.Ioc
{
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;

    public abstract class ServiceCollectionModuleBase
    {
        public IConfiguration Configuration { get; set; }

        public abstract void Configure(IServiceCollection services);

        protected T AddSettingAsOptions<T>(IServiceCollection services)
            where T : class, new()
        {
            return services.AddOptions<T>(Configuration);
        }
    }
}
