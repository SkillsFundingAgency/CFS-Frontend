using System;
using System.Linq;

namespace Microsoft.AspNetCore.Mvc.ModelBinding
{
    public static class ModelStateExtensions
    {
        public static bool IsPropertyInvalid(this ModelStateDictionary modelState, string propertyName)
        {
            var entries = modelState.Where(m => string.Equals(m.Key, propertyName, StringComparison.InvariantCultureIgnoreCase));

            return entries.Where(m => m.Value.Errors.Any()).Any();
        }
    }
}
