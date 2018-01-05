using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class CreateSpecificationModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;

        public List<Reference> FundingStreams { get; set; }
        public Specification Specification { get; set; }

        public string AcademicYearId { get; set; }

        public CreateSpecificationModel(ISpecsApiClient specsClient)
        {
            _specsClient = specsClient;
        }

        public async Task<IActionResult> OnGetAsync(string academicYearId)
        {
            var yearsResponse = await _specsClient.GetAcademicYears();
            var years = yearsResponse.Content;

            Specification = new Specification
            {
                AcademicYear = years.FirstOrDefault(m => m.Id == academicYearId),
                FundingStream = new Reference()
            };

            FundingStreams = new List<Reference>
            {
                new Reference("gag", "General Annual Grant")

            };

            AcademicYearId = academicYearId;

            return Page();
        }
    }


}