namespace CalculateFunding.Frontend.Pages.Specs
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;
    using Microsoft.AspNetCore.Mvc.Rendering;

    public class IndexModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;

        public IndexModel(ISpecsApiClient specsClient)
        {
            _specsClient = specsClient;
        }

        public IEnumerable<SpecificationSummary> Specifications { get; set; }

        public IList<SelectListItem> FundingPeriods { get; set; }

        public string FundingPeriodId { get; set; }

        public async Task<IActionResult> OnGetAsync(string fundingPeriodId = null)
        {
            var yearsResponse = await _specsClient.GetFundingPeriods();
            var fundingPeriods = yearsResponse.Content;

            if (string.IsNullOrWhiteSpace(fundingPeriodId))
            {
                fundingPeriodId = fundingPeriods.FirstOrDefault().Id;
            }

            var specstask = _specsClient.GetSpecifications(fundingPeriodId);

            Specifications = specstask.Result == null ? new List<SpecificationSummary>() : specstask.Result.Content;

            FundingPeriods = fundingPeriods.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name,
                Selected = m.Id == fundingPeriodId
            }).ToList();

            FundingPeriodId = fundingPeriodId;

            return Page();
        }
    }
}
