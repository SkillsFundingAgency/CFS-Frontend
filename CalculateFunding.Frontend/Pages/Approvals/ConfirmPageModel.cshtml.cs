using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using CalculateFunding.Common.Utility;
using CalculateFunding.Frontend.Clients.CommonModels;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
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

        public string FundingStreamId { get; set; }

        public SpecificationSummaryViewModel SpecificationViewModel { get; set; }

        public async Task<IActionResult> OnGetAsync(string specificationId, string fundingPeriodId, string fundingStreamId)
        {
            Guard.IsNullOrWhiteSpace(specificationId, nameof(specificationId));
            Guard.IsNullOrWhiteSpace(fundingPeriodId, nameof(fundingPeriodId));
            Guard.IsNullOrWhiteSpace(fundingStreamId, nameof(fundingStreamId));

            SpecificationId = specificationId;

            FundingPeriodId = fundingPeriodId;

            FundingStreamId = fundingStreamId;

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