using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Common.Utility;
using CalculateFunding.Common.ApiClient.Models;
using CalculateFunding.Common.ApiClient.Specifications;
using CalculateFunding.Common.ApiClient.Specifications.Models;
using CalculateFunding.Frontend.ViewModels.Common;
using CalculateFunding.Frontend.ViewModels.Specs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Approvals
{
    public class ConfirmPageModel : PageModel
    {
        private readonly ISpecificationsApiClient _specificationsApiClient;

        public ConfirmPageModel(ISpecificationsApiClient specificationsApiClient)
        {
            _specificationsApiClient = specificationsApiClient;
        }

        public string SpecificationId { get; set; }

        public string FundingPeriodId { get; set; }

        public SpecificationSummaryViewModel SpecificationViewModel { get; set; }

        public async Task<IActionResult> OnGetAsync(string specificationId, string fundingPeriodId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));

            SpecificationId = specificationId;

            FundingPeriodId = fundingPeriodId;

            ApiResponse<SpecificationSummary> specificationLookupTask = await _specificationsApiClient.GetSpecificationSummaryById(specificationId);

            IActionResult specificationLookupError = specificationLookupTask.IsSuccessOrReturnFailureResult("Specification");

            if (specificationLookupError == null)
            {
                SpecificationViewModel = new SpecificationSummaryViewModel
                {
                    Name = specificationLookupTask.Content.Name,
                    FundingStreams = specificationLookupTask.Content.FundingStreams.Select(m => new ReferenceViewModel(m.Id, m.Name)),
                    FundingPeriod = new ReferenceViewModel(specificationLookupTask.Content.FundingPeriod.Id, specificationLookupTask.Content.FundingPeriod.Name)
                };

                return Page();
            }
            else
            {
                return specificationLookupError;
            }
        }
    }
}