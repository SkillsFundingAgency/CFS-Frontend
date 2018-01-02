using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.ApiClient.Models.Results;
using CalculateFunding.Frontend.Interfaces.APiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Specs
{
    public class IndexModel : PageModel
    {
        private readonly IAllocationsApiClient _apiClient;
        public IList<Specification> Specifications;

        public IndexModel(IAllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }

       

        public async Task<IActionResult> OnGetAsync()
        {
            var results = await _apiClient.GetSpecifications();

            Specifications = results.Content;
            return Page();
        }
    }

}
