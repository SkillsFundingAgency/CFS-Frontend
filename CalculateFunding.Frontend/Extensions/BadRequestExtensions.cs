using System;
using System.Collections.Generic;
using System.Net;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.Utility;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Extensions
{
    public static class BadRequestExtensions
    {
        public static bool IsBadRequest<TContent>(this ValidatedApiResponse<TContent> validatedApiResponse,
            out BadRequestObjectResult result)
        {
            Guard.ArgumentNotNull(validatedApiResponse, $"{typeof(TContent).Name} {nameof(validatedApiResponse)}");

            if (validatedApiResponse.StatusCode == HttpStatusCode.BadRequest)
            {
                result = new BadRequestObjectResult(validatedApiResponse.ModelState ?? new Dictionary<string, IEnumerable<string>>());

                return true;
            }

            result = null;

            return false;
        }
    }
}