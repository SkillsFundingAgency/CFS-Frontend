using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Clients.SpecsClient
{
    public static class SpecsClientExtensions
    {
        public static IActionResult IsSuccessfulOrReturnFailureResult(this ApiResponse<SpecificationSummary> apiResponse)
        {
            return ApiResponseExtensions.IsSuccessOrReturnFailureResult(apiResponse, "Specification");
        }


    }
}
