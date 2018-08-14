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
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;

namespace CalculateFunding.Frontend.Pages.Approvals
{
    public class ConfirmPublishModel : PageModel
    {
        private readonly IMapper _mapper;
        private readonly IResultsApiClient _resultsClient;
        private readonly ISpecsApiClient _specsClient;

        public ConfirmPublishModel(IResultsApiClient resultsClient, ISpecsApiClient specsClient, IMapper mapper)
        {
            Guard.ArgumentNotNull(resultsClient, nameof(resultsClient));
            Guard.ArgumentNotNull(specsClient, nameof(specsClient));
            Guard.ArgumentNotNull(mapper, nameof(mapper));

            _resultsClient = resultsClient;
            _specsClient = specsClient;
            _mapper = mapper;
        }

        [BindProperty]
        public string SpecificationId { get; set; }

        [BindProperty]
        public IEnumerable<PublishedAllocationLineResultStatusUpdateProviderViewModel> AllocationLines { get; set; }

        public ConfirmPublishApproveViewModel ConfirmationDetails { get; set; }

        public string ErrorMessage { get; set; }

        public string UpdateStatusModelJson { get; set; }

        public IActionResult OnGet()
        {
            // The page is not accessible via a GET request
            ErrorMessage = "To confirm publishing of funding please visit the Approve and Publish Funding page.";
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (string.IsNullOrEmpty(SpecificationId))
            {
                ErrorMessage = "Specification ID was not provided";
                return Page();
            }

            if (AllocationLines == null || AllocationLines.Count() == 0)
            {
                ErrorMessage = "No Providers or Allocations were provided";
                return Page();
            }

            PublishedAllocationLineResultStatusUpdateModel fetchItemsModel = BuildUpdateModel();
            fetchItemsModel.Status = AllocationLineStatus.Approved; // Only want results that can be published

            // Build another model for changing the status to published when the 'Confirm Publish' button is pressed
            PublishedAllocationLineResultStatusUpdateViewModel updateModel = new PublishedAllocationLineResultStatusUpdateViewModel
            {
                Status = AllocationLineStatusViewModel.Published,
                Providers = AllocationLines
            };
            UpdateStatusModelJson = JsonConvert.SerializeObject(updateModel);

            ValidatedApiResponse<ConfirmPublishApprove> providerResultsResponse = await _resultsClient.GetProviderResultsForPublishOrApproval(SpecificationId, fetchItemsModel);
            IActionResult errorResult = providerResultsResponse.IsSuccessOrReturnFailureResult("Confirmation Provider Results");
            if (errorResult != null)
            {
                ErrorMessage = "An error occured retrieving the confirmation details.";
                return Page();
            }

            this.ConfirmationDetails = _mapper.Map<ConfirmPublishApproveViewModel>(providerResultsResponse.Content);

            var specification = await _specsClient.GetSpecification(SpecificationId);
            this.ConfirmationDetails.SpecificationName = specification.Content.Name;

            return Page();
        }

        private PublishedAllocationLineResultStatusUpdateModel BuildUpdateModel()
        {
            PublishedAllocationLineResultStatusUpdateModel updateModel = new PublishedAllocationLineResultStatusUpdateModel();

            Dictionary<string, PublishedAllocationLineResultStatusUpdateProviderModel> updateProviders = new Dictionary<string, PublishedAllocationLineResultStatusUpdateProviderModel>();
            foreach (PublishedAllocationLineResultStatusUpdateProviderViewModel updateItem in AllocationLines)
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

            return updateModel;
        }
    }
}