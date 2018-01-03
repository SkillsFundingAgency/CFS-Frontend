using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class IndexModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        public IList<Specification> Specifications;

        public IndexModel(ISpecsApiClient specsClient)
        {
            _specsClient = specsClient;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var results = await _specsClient.GetSpecifications();

            Specifications = results.Content;
            return Page();
        }
    }
}
