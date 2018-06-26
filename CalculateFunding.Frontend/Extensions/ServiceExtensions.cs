namespace Microsoft.Extensions.DependencyInjection
{
    using System.Reflection;
    using CalculateFunding.Frontend.Core.Attributes;
    using CalculateFunding.Frontend.Core.Ioc;
    using CalculateFunding.Frontend.Extensions;
    using Microsoft.Extensions.Configuration;

    public static class ServiceExtensions
    {
        public static IServiceCollection AddModule<T>(this IServiceCollection services, T module, IConfiguration configuration)
            where T : ServiceCollectionModuleBase
        {
            module.Configuration = configuration;
            module.Configure(services);

            return services;
        }

        public static IServiceCollection AddModule<T>(this IServiceCollection services, IConfiguration configuration)
            where T : ServiceCollectionModuleBase, new()
        {
            var module = new T();

            return AddModule(services, module, configuration);
        }

        public static T AddOptions<T>(this IServiceCollection services, IConfiguration configuration)
            where T : class, new()
        {
            var sectionName = GetSectionName<T>();

            configuration.NotifyOptions<T>(sectionName);

            var configSection = configuration.GetSection(sectionName);

            var settingsClass = configSection.Get<T>() ?? new T();

            services.Configure<T>(configSection);

            return settingsClass;
        }

        private static string GetSectionName<T>()
        {
            var type = typeof(T);
            var configGroup = type.GetTypeInfo().GetCustomAttribute<ConfigGroupAttribute>()?.Name;

            var name = type.Name;
            if (!string.IsNullOrWhiteSpace(configGroup))
            {
                name = $"{configGroup}:{name}";
            }

            return name;
        }
    }
}
