using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Approvals;
using Microsoft.AspNetCore.Mvc;

namespace CalculateFunding.Frontend.Controllers
{
    public class ApprovalController : Controller
    {
        private readonly IResultsApiClient _resultsClient;
        private readonly IMapper _mapper;

        public ApprovalController(IResultsApiClient resultsApiClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(resultsApiClient, nameof(resultsApiClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _resultsClient = resultsApiClient;
            _mapper = mapper;
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
    }
}
