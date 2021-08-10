namespace Microsoft.AspNetCore.Mvc.ModelBinding
{
    using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    using System.Linq;

    public static class ModelStateExtensions
    {
        public static bool IsPropertyInvalid(this ModelStateDictionary modelState, string propertyName)
        {
            var entries = modelState.Where(m => string.Equals(m.Key, propertyName, StringComparison.InvariantCultureIgnoreCase));

            return entries.Where(m => m.Value.Errors.Any()).Any();
        }

        public static IDictionary<string, IEnumerable<string>> GetModelStateEntyItems(this string message)
        {
            return JsonConvert.DeserializeObject<IDictionary<string, IEnumerable<string>>>(message);
        }

        public static void AddModelStateErrors(this ModelStateDictionary modelState, IDictionary<string, IEnumerable<string>> modelStateEntryItems)
        {
            foreach (KeyValuePair<string, IEnumerable<string>> item in modelStateEntryItems)
            {
                modelState.AddModelError(item.Key, string.Join(',', item.Value));
            }
        }
    }
}
