using System;
using System.Collections.Generic;
using System.Net;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Common.ApiClient.Models
{
    public static class ApiResponseExtensions
    {
        public static IActionResult Handle<T>(
            this ValidatedApiResponse<T> apiResponse, 
            string entityName, 
            Func<ApiResponse<T>, IActionResult> onSuccess,
            bool treatNoContentAsSuccess = false)
        {
            IActionResult errorResult = apiResponse.IsSuccessOrReturnFailureResult(entityName, treatNoContentAsSuccess);
            return errorResult ?? onSuccess(apiResponse);
        }
        
        
        public static IActionResult Handle<T>(
            this ApiResponse<T> apiResponse, 
            string entityName, 
            Func<ApiResponse<T>, IActionResult> onSuccess,
            bool treatNoContentAsSuccess = false)
        {
            IActionResult errorResult = apiResponse.IsSuccessOrReturnFailureResult(entityName, treatNoContentAsSuccess);
            return errorResult ?? onSuccess(apiResponse);
        }
        
        public static IActionResult IsSuccessOrReturnFailureResult<T>(
            this ValidatedApiResponse<T> apiResponse, 
            string entityName, 
            bool treatNoContentAsSuccess = false)
        {
            if (apiResponse != null && apiResponse.IsBadRequest(out BadRequestObjectResult badRequestObject))
            {
                return badRequestObject;
            }

            return (apiResponse as ApiResponse<T>).IsSuccessOrReturnFailureResult(entityName, treatNoContentAsSuccess);
        }
        
        public static IActionResult IsSuccessOrReturnFailureResult<T>(this ApiResponse<T> apiResponse, string entityName, bool treatNoContentAsSuccess = false)
        {
            Guard.IsNullOrWhiteSpace(entityName, nameof(entityName));

            if (apiResponse == null)
            {
                return new InternalServerErrorResult($"{entityName} API response returned null.");
            }

            if (apiResponse.StatusCode == HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult($"{entityName} not found.");
            }

            if (treatNoContentAsSuccess && apiResponse.StatusCode == HttpStatusCode.NoContent)
            {
                return null;
            }

            if (apiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            if (apiResponse.StatusCode != HttpStatusCode.OK)
            {
                return new InternalServerErrorResult($"{entityName} API call did not return success, but instead '{apiResponse.StatusCode}'");
            }

            if (EqualityComparer<T>.Default.Equals(apiResponse.Content, default(T)))
            {
                return new NotFoundObjectResult($"{entityName} returned null.");
            }

            return null;
        }
    }
}
