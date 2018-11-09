using CalculateFunding.Common.ApiClient.Models;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Collections.Generic;

namespace CalculateFunding.Frontend.Extensions
{
    public static class ValidatedResponseExtensions
    {
        public static void AddValidationResultErrors<T>(this ValidatedApiResponse<T> response, ModelStateDictionary modelState)
        {
            if (modelState != null && response != null)
            {
                foreach (var validationResult in response.ModelState)
                {
                    List<string> errors = new List<string>(validationResult.Value);
                    for (int i = 0; i < errors.Count; i++)
                    {
                        string key = validationResult.Key;
                        if (modelState.ContainsKey(validationResult.Key))
                        {
                            key = $"{validationResult.Key}.{i}";
                        }
                        modelState.AddModelError(key, errors[i]);
                    }
                }
            }
        }
    }
}
