using CalculateFunding.Common.ApiClient.Models;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.CalcEngine;
using CalculateFunding.Common.ApiClient.CalcEngine.Models;
using CalculateFunding.Common.Utility;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class CalculationResultsController : Controller
    {
        private readonly CalcEngineApiClient _calcEngineApiClient;

        public CalculationResultsController(CalcEngineApiClient calcEngineApiClient)
        {
            _calcEngineApiClient = calcEngineApiClient;
            Guard.ArgumentNotNull(calcEngineApiClient, nameof(calcEngineApiClient));
        }

        [HttpGet("api/specifications/{specificationId}/calculations/calculationType/{calculationType}")]
        public async Task<IActionResult> PreviewCalculationResults([FromRoute] string specificationId,
	        [FromRoute] string providerId)
        {
            ApiResponse<ProviderResult> providerResultResponse =
                await _calcEngineApiClient.PreviewCalculationResults(specificationId, providerId, null);
            IActionResult providerResultResponseErrorResult = providerResultResponse.IsSuccessOrReturnFailureResult("PreviewCalculationResults");
            if (providerResultResponseErrorResult != null)
            {
                return providerResultResponseErrorResult;
            }

            return Ok(providerResultResponse.Content);
        }
    }
}