using System;
using System.Collections.Generic;
using System.Linq;
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

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            PublishedAllocationLineResultStatusUpdateModel updateModel = new PublishedAllocationLineResultStatusUpdateModel()
            {
                Status = _mapper.Map<AllocationLineStatus>(allocationLines.Status),
            };

            Dictionary<string, PublishedAllocationLineResultStatusUpdateProviderModel> updateProviders = new Dictionary<string, PublishedAllocationLineResultStatusUpdateProviderModel>();
            foreach(var allo in allocationLines.Providers)
            {
                PublishedAllocationLineResultStatusUpdateProviderModel providerUpdateModel = null;
                if (!updateProviders.ContainsKey(allo.ProviderId))
                {
                    providerUpdateModel = new PublishedAllocationLineResultStatusUpdateProviderModel()
                    {
                        ProviderId = allo.ProviderId,
                    };

                    updateProviders.Add(allo.ProviderId, providerUpdateModel);
                    updateModel.AddProvider(providerUpdateModel);
                }
                else
                {
                    providerUpdateModel = updateProviders[allo.ProviderId];
                }

                providerUpdateModel.AddAllocationLine(allo.AllocationLineId);
            }

            ValidatedApiResponse<PublishedAllocationLineResultStatusUpdateResponseModel> updateStatusResponse = await _resultsClient.UpdatePublishedAllocationLineStatus(specificationId, updateModel);
            IActionResult errorResult = updateStatusResponse.IsSuccessOrReturnFailureResult("Allocation Line Status Update");
            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(updateStatusResponse.Content);
        }
    }
}
