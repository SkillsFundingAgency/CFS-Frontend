using System;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Results;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Mvc;
using FundingStructureResults = CalculateFunding.Common.ApiClient.Results.Models.FundingStructure;

namespace CalculateFunding.Frontend.Controllers
{
    public class FundingLineStructureController : Controller
    {
        private readonly ISpecificationsApiClient _specificationsApiClient;
        private readonly IResultsApiClient _resultsApiClient;

        public FundingLineStructureController(
            ISpecificationsApiClient specificationsApiClient,
            IResultsApiClient resultsApiClient)
        {
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));

            _specificationsApiClient = specificationsApiClient;
            _resultsApiClient = resultsApiClient;
        }

        [Obsolete]
        [HttpGet("api/fundingstructures/specifications/{specificationId}/fundingperiods/{fundingPeriodId}/fundingstreams/{fundingStreamId}/provider/{providerId}")]
        public async Task<IActionResult> GetFundingStructuresByProviderId(
          [FromRoute] string fundingStreamId,
          [FromRoute] string fundingPeriodId,
          [FromRoute] string specificationId,
          [FromRoute] string providerId)
        {
            string etag = Request.ReadETagHeaderValue();

            ApiResponse<FundingStructureResults> fundingStructureApiResponse = await _resultsApiClient.GetFundingStructureResults(fundingStreamId,
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

            ApiResponse<FundingStructure> fundingStructureApiResponse = await _specificationsApiClient.GetFundingStructure(fundingStreamId,
                fundingPeriodId,
                specificationId,
                etag: etag);

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

            ApiResponse<FundingStructure> fundingStructureApiResponse = await _specificationsApiClient.GetFundingStructure(fundingStreamId,
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
