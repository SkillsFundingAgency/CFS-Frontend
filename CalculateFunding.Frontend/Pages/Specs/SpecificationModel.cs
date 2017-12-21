using System.Collections.Generic;
using CalculateFunding.Frontend.ApiClient.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class SpecificationModel : PageModel
    {
        public List<Reference> AcademicYears { get; set; }
        public List<Reference> FundingStreams { get; set; }

        public Specification Specification { get; set; }
    
        public void OnGet()
        {
            AcademicYears = new List<Reference>
            {
                new Reference("1617", "2016-2017"),
                new Reference("1718", "2017-2018"),
                new Reference("1819", "2018-2019")

            };
            FundingStreams = new List<Reference>
            {
                new Reference("gag", "General Annual Grant")

            };

            Specification = new Specification{AcademicYear = new Reference("1718", "2017-2018")};
        }
    }


}