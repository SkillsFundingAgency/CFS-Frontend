using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;

namespace CalculateFunding.Frontend.Extensions
{
    [EditorBrowsable(EditorBrowsableState.Never)]
    static public class IConfigurationRootExtensions
    {
        static public Dictionary<string, Type> RegisteredOptionTypes { get; } = new Dictionary<string, Type>();

        static public T GetByTypeName<T>(this IConfiguration configurationRoot)
        {
            var section = configurationRoot.GetSection(typeof(T).Name);

            return section.Get<T>();
        }

        static public void NotifyOptions<T>(this IConfiguration configurationRoot, string sectionName)
        {
            if (!RegisteredOptionTypes.ContainsKey(sectionName))
                RegisteredOptionTypes.Add(sectionName, typeof(T));
        }
    }
}
