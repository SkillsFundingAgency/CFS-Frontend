using System;
using AutoMapper;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Common.Identity.Authorization.Models;
using CalculateFunding.Common.Utility;
//using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Extensions;
using CalculateFunding.Frontend.Helpers;
//using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Approvals;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Threading.Tasks;
using CalculateFunding.Common.ApiClient.Results;

namespace CalculateFunding.Frontend.Controllers
{
    public class ApprovalController : Controller
    {
        private readonly IResultsApiClient _resultsClient;
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;
        private readonly IAuthorizationHelper _authorizationHelper;

        public ApprovalController(IResultsApiClient resultsApiClient, ISpecsApiClient specsClient, IMapper mapper, IAuthorizationHelper authorizationHelper)
        {
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(authorizationHelper, nameof(authorizationHelper));

            _resultsClient = resultsApiClient;
            _mapper = mapper;
            _specsClient = specsClient;
            _authorizationHelper = authorizationHelper;
        }

        [Obsolete]
        [Route("api/specs/{specificationId}/allocationlineapprovalstatus")]
        [HttpPut]
        public async Task<IActionResult> UpdateApprovalStatusForAllocationLine([FromRoute]string specificationId, [FromBody]PublishedAllocationLineResultStatusUpdateViewModel allocationLines)
        {
			//TODO; the old implementation used allocation lines and was obsolete

	        return StatusCode((int)HttpStatusCode.Gone);
        }

        [Route("api/specs/{specificationId}/refresh-published-results")]
        [HttpPost]
        public async Task<IActionResult> RefreshPublishedResults(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            if (!await _authorizationHelper.DoesUserHavePermission(User, specificationId, SpecificationActionTypes.CanRefreshFunding))
            {
                return new ForbidResult();
            }

            ApiResponse<SpecificationCalculationExecutionStatusModel> callResult = await _specsClient.RefreshPublishedResults(specificationId);

            if (callResult.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(callResult.Content);
            }
            else if (callResult.StatusCode == HttpStatusCode.NoContent)
            {
                return new NoContentResult();
            }
            else if (callResult.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new InternalServerErrorResult($"Unexpected status from API call: '{callResult.StatusCode}'");
        }

        [Route("api/specs/{specificationId}/check-publish-result-status")]
        [HttpPost]
        public async Task<IActionResult> CheckPublishResultStatus(string specificationId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

            ApiResponse<SpecificationCalculationExecutionStatusModel> callResult = await _specsClient.CheckPublishResultStatus(specificationId);

            if (callResult.StatusCode == HttpStatusCode.OK)
            {
                return new OkObjectResult(callResult.Content);
            }

            if (callResult.StatusCode == HttpStatusCode.BadRequest)
            {
                return new BadRequestResult();
            }

            return new StatusCodeResult(500);
        }

        [Obsolete]
        [Route("/api/results/get-published-provider-results-for-funding-stream")]
        public async Task<IActionResult> GetPublishedProviderResultsForFundingStream([FromQuery]string fundingPeriodId, [FromQuery]string specificationId, [FromQuery] string fundingStreamId)
        {
	        //TODO; the old implementation used allocation lines and was obsolete

            return StatusCode((int)HttpStatusCode.Gone);
        }

        [Obsolete]
        [Route("/api/results/published-provider-profile/providerId/{providerId}/specificationId/{specificationId}/fundingStreamId/{fundingStreamId}")]
        public async Task<IActionResult> PublishedProviderProfile([FromRoute] string providerId, [FromRoute] string specificationId, [FromRoute] string fundingStreamId)
        {
	        //TODO; the old implementation used allocation lines and was obsolete

            return StatusCode((int)HttpStatusCode.Gone);
        }
    }
}
