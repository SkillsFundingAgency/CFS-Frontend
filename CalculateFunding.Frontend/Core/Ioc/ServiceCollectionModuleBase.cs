namespace CalculateFunding.Frontend.Core.Ioc
{
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;

    public abstract class ServiceCollectionModuleBase
    {
        public IConfiguration Configuration { get; set; }

        public IWebHostEnvironment HostingEnvironment { get; set; }

        public abstract void Configure(IServiceCollection services);

        protected T AddSettingAsOptions<T>(IServiceCollection services)
            where T : class, new()
        {
            return services.AddOptions<T>(Configuration);
        }

        protected T GetConfigurationOptions<T>(string configurationPrefix)
           where T : class, new()
        {
            T optionsClass = new T();

            Configuration.Bind(configurationPrefix, optionsClass);

            return optionsClass;
        }
    }
}
