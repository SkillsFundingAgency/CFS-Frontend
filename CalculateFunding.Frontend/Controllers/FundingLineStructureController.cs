using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class FundingLineStructureController : Controller
    {
        private readonly ISpecificationsApiClient _specificationsApiClient;

        public FundingLineStructureController(ISpecificationsApiClient specificationsApiClient)
        {
            Guard.ArgumentNotNull(specificationsApiClient, nameof(specificationsApiClient));

            _specificationsApiClient = specificationsApiClient;
        }

        [HttpGet("api/fundingstructures/specifications/{specificationId}/fundingperiods/{fundingPeriodId}/fundingstreams/{fundingStreamId}")]
        public async Task<IActionResult> GetFundingStructures(
            [FromRoute] string fundingStreamId,
            [FromRoute] string fundingPeriodId,
            [FromRoute] string specificationId)
        {
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

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
