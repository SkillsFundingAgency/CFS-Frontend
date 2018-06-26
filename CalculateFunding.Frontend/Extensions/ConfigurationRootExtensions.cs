namespace CalculateFunding.Frontend.Extensions
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel;
    using Microsoft.Extensions.Configuration;

    [EditorBrowsable(EditorBrowsableState.Never)]
    public static class IConfigurationRootExtensions
    {
        public static Dictionary<string, Type> RegisteredOptionTypes { get; } = new Dictionary<string, Type>();

        public static T GetByTypeName<T>(this IConfiguration configurationRoot)
        {
            var section = configurationRoot.GetSection(typeof(T).Name);

            return section.Get<T>();
        }

        public static void NotifyOptions<T>(this IConfiguration configurationRoot, string sectionName)
        {
            if (!RegisteredOptionTypes.ContainsKey(sectionName))
            {
                RegisteredOptionTypes.Add(sectionName, typeof(T));
            }
        }
    }
}
