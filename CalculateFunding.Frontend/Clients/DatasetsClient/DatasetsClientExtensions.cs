using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.DatasetsClient.Models;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Clients.DatasetsClient
{
    public static class DatasetsClientExtensions
    {
        public static IActionResult IsSuccessfulOrReturnFailureResult(this ApiResponse<DatasetVersionResponse> apiResponse)
        {
            return ApiResponseExtensions.IsSuccessOrReturnFailureResult(apiResponse, "Dataset");
        }

    }
}
