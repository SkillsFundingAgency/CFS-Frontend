using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Helpers;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using CalculateFunding.Frontend.ViewModels.Approvals;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Approvals
{
    public class ConfirmApprovalModel : PageModel
    {
        private readonly IMapper _mapper;
        private readonly IResultsApiClient _resultsClient;

        public ConfirmApprovalModel(IResultsApiClient resultsClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(resultsClient, nameof(resultsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _resultsClient = resultsClient;
            _mapper = mapper;
        }

        public ConfirmPublishApproveViewModel ConfirmationDetails { get; set; }

        public class Xyz
        {
            public string SpecificationId { get; set; }
            public PublishedAllocationLineResultStatusUpdateViewModel Filter { get; set; }
        }

        public async Task<IActionResult> OnPostAsync([FromBody] Xyz filter)
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            PublishedAllocationLineResultStatusUpdateModel updateModel = new PublishedAllocationLineResultStatusUpdateModel()
            {
                Status = AllocationLineStatus.Held // Only want results that can be approved
            };

            Dictionary<string, PublishedAllocationLineResultStatusUpdateProviderModel> updateProviders = new Dictionary<string, PublishedAllocationLineResultStatusUpdateProviderModel>();
            foreach (PublishedAllocationLineResultStatusUpdateProviderViewModel updateItem in filter.Filter.Providers)
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

            ValidatedApiResponse<ConfirmPublishApprove> providerResultsResponse = await _resultsClient.GetProviderResultsForPublishOrApproval(filter.SpecificationId, updateModel);
            IActionResult errorResult = providerResultsResponse.IsSuccessOrReturnFailureResult("Confirmation Provider Results");
            if (errorResult != null)
            {
                return Page();
            }

            this.ConfirmationDetails = _mapper.Map<ConfirmPublishApproveViewModel>(providerResultsResponse.Content);

            return Page();
        }

        //public async Task<IActionResult> OnPostConfirmApprovalAsync()
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return Page();
        //    }

        //}
    }
}