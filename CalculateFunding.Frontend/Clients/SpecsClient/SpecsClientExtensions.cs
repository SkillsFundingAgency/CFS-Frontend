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
            string entityName = "Specification";
            if(apiResponse == null)
            {
                return new InternalServerErrorResult($"{entityName} API response returned null.");
            }

            if(apiResponse.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return new NotFoundObjectResult($"{entityName} not found.");
            }

            if(apiResponse.StatusCode != System.Net.HttpStatusCode.OK)
            {
                return new InternalServerErrorResult($"{entityName} API call did not return succes, but instead '{apiResponse.StatusCode}'");
            }

            if(apiResponse.Content  == null)
            {
                return new NotFoundObjectResult($"{entityName} returned null.");
            }

            return null;
        }
    }
}
