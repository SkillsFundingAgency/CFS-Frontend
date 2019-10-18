using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
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
        private readonly ISpecsApiClient _specsClient;

        private readonly IMapper _mapper;

        public ConfirmPageModel(ISpecsApiClient specsClient, IMapper mapper)
        {
            _specsClient = specsClient;
            _mapper = mapper;
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

            ApiResponse<Specification> specificationLookupTask = await _specsClient.GetSpecification(specificationId);

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