﻿namespace Microsoft.AspNetCore.Mvc.ModelBinding
{
    using System;
    using System.Linq;

    public static class ModelStateExtensions
    {
        public static bool IsPropertyInvalid(this ModelStateDictionary modelState, string propertyName)
        {
            var entries = modelState.Where(m => string.Equals(m.Key, propertyName, StringComparison.InvariantCultureIgnoreCase));

            return entries.Where(m => m.Value.Errors.Any()).Any();
        }
    }
}
