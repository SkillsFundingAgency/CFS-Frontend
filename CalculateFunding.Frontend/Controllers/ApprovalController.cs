using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Approvals;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class ApprovalController : Controller
    {
        private readonly IResultsApiClient _resultsClient;
        private readonly ISpecsApiClient _specsClient;
        private readonly IMapper _mapper;

        public ApprovalController(IResultsApiClient resultsApiClient, ISpecsApiClient specsClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));

            _resultsClient = resultsApiClient;
            _mapper = mapper;
	        _specsClient = specsClient;
        }

        [Route("api/specs/{specificationId}/allocationlineapprovalstatus")]
        [HttpPut]
        public async Task<IActionResult> UpdateApprovalStatusForAllocationLine([FromRoute]string specificationId, [FromBody]PublishedAllocationLineResultStatusUpdateViewModel allocationLines)
        {
            Guard.ArgumentNotNull(allocationLines, nameof(allocationLines));

            if (allocationLines.Status != AllocationLineStatusViewModel.Approved && allocationLines.Status != AllocationLineStatusViewModel.Published)
            {
                ModelState.AddModelError(nameof(allocationLines.Status), "The status provided is not a valid destination status");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            PublishedAllocationLineResultStatusUpdateModel updateModel = new PublishedAllocationLineResultStatusUpdateModel()
            {
                Status = _mapper.Map<AllocationLineStatus>(allocationLines.Status),
            };

            Dictionary<string, PublishedAllocationLineResultStatusUpdateProviderModel> updateProviders = new Dictionary<string, PublishedAllocationLineResultStatusUpdateProviderModel>();
            foreach (PublishedAllocationLineResultStatusUpdateProviderViewModel updateItem in allocationLines.Providers)
            {
                PublishedAllocationLineResultStatusUpdateProviderModel providerUpdateModel = null;
                if (!updateProviders.ContainsKey(updateItem.ProviderId))
                {
                    providerUpdateModel = new PublishedAllocationLineResultStatusUpdateProviderModel()
                    {
                        ProviderId = updateItem.ProviderId,
                    };

                    updateProviders.Add(updateItem.ProviderId, providerUpdateModel);
                    updateModel.AddProvider(providerUpdateModel);
                }
                else
                {
                    providerUpdateModel = updateProviders[updateItem.ProviderId];
                }

                providerUpdateModel.AddAllocationLine(updateItem.AllocationLineId);
            }

            ValidatedApiResponse<PublishedAllocationLineResultStatusUpdateResponseModel> updateStatusResponse = await _resultsClient.UpdatePublishedAllocationLineStatus(specificationId, updateModel);
            IActionResult errorResult = updateStatusResponse.IsSuccessOrReturnFailureResult("Allocation Line Status Update");
            if (errorResult != null)
            {
                return errorResult;
            }

            PublishedAllocationLineResultStatusUpdateResponseViewModel result = _mapper.Map<PublishedAllocationLineResultStatusUpdateResponseViewModel>(updateStatusResponse.Content);

            return Ok(result);
        }

	    [Route("api/specs/{specificationId}/refresh-published-results")]
	    [HttpPost]
	    public async Task<IActionResult> RefreshPublishedResults(string specificationId)
	    {
		    Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));

		    ApiResponse<SpecificationCalculationExecutionStatusModel> callResult = await _specsClient.RefreshPublishedResults(specificationId);

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



        [Route("/api/results/get-published-provider-results-for-funding-stream")]
        public async Task<IActionResult> GetPublishedProviderResultsForFundingStream([FromQuery]string fundingPeriodId, [FromQuery]string specificationId, [FromQuery] string fundingStreamId, CancellationToken cancellationToken)
        {
            Guard.ArgumentNotNull(fundingPeriodId, nameof(fundingPeriodId));
            Guard.ArgumentNotNull(specificationId, nameof(specificationId));
            Guard.ArgumentNotNull(fundingStreamId, nameof(fundingStreamId));

            ApiResponse<IEnumerable<PublishedProviderResult>> publishedProviderResponse = await _resultsClient.GetPublishedProviderResults(fundingPeriodId, specificationId, fundingStreamId, cancellationToken);
            IActionResult errorResult = publishedProviderResponse.IsSuccessOrReturnFailureResult("Getting published provider results for funding stream");
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(publishedProviderResponse.Content);
        }
    }
}
