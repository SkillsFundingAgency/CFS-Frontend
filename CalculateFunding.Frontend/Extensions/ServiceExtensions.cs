namespace Microsoft.Extensions.DependencyInjection
{
    using System.Reflection;
    using CalculateFunding.Frontend.Core.Attributes;
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.Extensions;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.Configuration;

    public static class ServiceExtensions
    {
        public static IServiceCollection AddModule<T>(this IServiceCollection services, T module, IConfiguration configuration, IHostingEnvironment hostingEnvironment)
            where T : ServiceCollectionModuleBase
        {
            module.Configuration = configuration;
            module.HostingEnvironment = hostingEnvironment;
            module.Configure(services);

            return services;
        }

        public static IServiceCollection AddModule<T>(this IServiceCollection services, IConfiguration configuration)
            where T : ServiceCollectionModuleBase, new()
        {
            T module = new T();

            return AddModule(services, module, configuration, null);
        }

        public static IServiceCollection AddModule<T>(this IServiceCollection services, IConfiguration configuration, IHostingEnvironment hostingEnvironment)
            where T : ServiceCollectionModuleBase, new()
        {
            T module = new T();

            return AddModule(services, module, configuration, hostingEnvironment);
        }

        public static T AddOptions<T>(this IServiceCollection services, IConfiguration configuration)
            where T : class, new()
        {
            string sectionName = GetSectionName<T>();

            configuration.NotifyOptions<T>(sectionName);

            IConfigurationSection configSection = configuration.GetSection(sectionName);

            T settingsClass = configSection.Get<T>() ?? new T();

            services.Configure<T>(configSection);

            return settingsClass;
        }

        private static string GetSectionName<T>()
        {
            System.Type type = typeof(T);
            string configGroup = type.GetTypeInfo().GetCustomAttribute<ConfigGroupAttribute>()?.Name;

            string name = type.Name;
            if (!string.IsNullOrWhiteSpace(configGroup))
            {
                name = $"{configGroup}:{name}";
            }

            return name;
        }
    }
}
