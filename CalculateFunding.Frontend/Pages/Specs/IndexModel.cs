using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.SpecsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class IndexModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        public IList<Specification> Specifications;
        public IList<SelectListItem> Years;

        public string AcademicYearId { get; set; }

        public IndexModel(ISpecsApiClient specsClient)
        {
            _specsClient = specsClient;
        }

        public async Task<IActionResult> OnGetAsync(string academicYearId = null)
        {
            var yearsResponse = await _specsClient.GetAcademicYears();
            var years = yearsResponse.Content;

            if (string.IsNullOrWhiteSpace(academicYearId))
                academicYearId = years.FirstOrDefault().Id;

            var specstask = _specsClient.GetSpecifications(academicYearId);

            Specifications = specstask.Result == null ? new List<Specification>() : specstask.Result.Content;

            Years = years.Select(m => new SelectListItem
            {
                Value = m.Id,
                Text = m.Name,
                Selected = (m.Id == academicYearId)
            }).ToList();

            AcademicYearId = academicYearId;

            return Page();
        }
    }
}
