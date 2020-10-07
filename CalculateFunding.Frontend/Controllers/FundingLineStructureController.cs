using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Results.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class FundingLineStructureController : Controller
    {
        private readonly IResultsApiClient _resultsApiClient;

        public FundingLineStructureController(
            IResultsApiClient resultsApiClient)
        {
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));

            _resultsApiClient = resultsApiClient;
        }

        [HttpGet("api/fundingstructures/specifications/{specificationId}/fundingperiods/{fundingPeriodId}/fundingstreams/{fundingStreamId}/provider/{providerId}")]
        public async Task<IActionResult> GetFundingStructuresByProviderId(
	        [FromRoute] string fundingStreamId,
	        [FromRoute] string fundingPeriodId,
	        [FromRoute] string specificationId,
	        [FromRoute] string providerId)
        {
            string etag = Request.ReadETagHeaderValue();

            ApiResponse<FundingStructure> fundingStructureApiResponse = await _resultsApiClient.GetFundingStructureResults(fundingStreamId,
                fundingPeriodId,
                specificationId,
                providerId,
                etag);
            
            if (fundingStructureApiResponse.StatusCode == HttpStatusCode.NotModified)
            {
                return new StatusCodeResult(304);
            }

            Response.CopyCacheControlHeaders(fundingStructureApiResponse.Headers);
            
            IActionResult fundingStructureErrorResult =
                fundingStructureApiResponse.IsSuccessOrReturnFailureResult("GetFundingStructuresByProviderId");
            if (fundingStructureErrorResult != null)
            {
                return fundingStructureErrorResult;
            }

            return Ok(fundingStructureApiResponse.Content.Items);
        }

        [HttpGet("api/fundingstructures/results/specifications/{specificationId}/fundingperiods/{fundingPeriodId}/fundingstreams/{fundingStreamId}")]
        public async Task<IActionResult> GetFundingStructuresWithCalculationResult(
            [FromRoute] string fundingStreamId,
            [FromRoute] string fundingPeriodId,
            [FromRoute] string specificationId)
        {
            string etag = Request.ReadETagHeaderValue();

            ApiResponse<FundingStructure> fundingStructureApiResponse = await _resultsApiClient.GetFundingStructureResults(fundingStreamId,
                fundingPeriodId,
                specificationId,
                etag:etag);
            
            if (fundingStructureApiResponse.StatusCode == HttpStatusCode.NotModified)
            {
                return new StatusCodeResult(304);
            }

            Response.CopyCacheControlHeaders(fundingStructureApiResponse.Headers);
            
            IActionResult fundingStructureErrorResult =
                fundingStructureApiResponse.IsSuccessOrReturnFailureResult("GetFundingStructuresWithCalculationResult");
            if (fundingStructureErrorResult != null)
            {
                return fundingStructureErrorResult;
            }

            return Ok(fundingStructureApiResponse.Content.Items);
        }

        [HttpGet("api/fundingstructures/specifications/{specificationId}/fundingperiods/{fundingPeriodId}/fundingstreams/{fundingStreamId}")]
        public async Task<IActionResult> GetFundingStructures(
	        [FromRoute] string fundingStreamId,
	        [FromRoute] string fundingPeriodId,
	        [FromRoute] string specificationId)
        {
            string etag = Request.ReadETagHeaderValue();

            ApiResponse<FundingStructure> fundingStructureApiResponse = await _resultsApiClient.GetFundingStructure(fundingStreamId,
                fundingPeriodId,
                specificationId,
                etag);
            
            if (fundingStructureApiResponse.StatusCode == HttpStatusCode.NotModified)
            {
                return new StatusCodeResult(304);
            }

            Response.CopyCacheControlHeaders(fundingStructureApiResponse.Headers);
            
            IActionResult fundingStructureErrorResult =
                fundingStructureApiResponse.IsSuccessOrReturnFailureResult("GetFundingStructures");
            if (fundingStructureErrorResult != null)
            {
                return fundingStructureErrorResult;
            }

            return Ok(fundingStructureApiResponse.Content.Items);
        }
    }
}
