using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Allocations.Web.ApiClient;
using Allocations.Web.ApiClient.Models;
using Allocations.Web.ApiClient.Models.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Allocations.Web.Pages.Providers
{
    public class IndexModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;
        public IList<ProviderTestResult> Providers { get; set; }

        public IndexModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }

        public async Task<IActionResult> OnGetAsync(string id)
        {
            var results = await _apiClient.GetProviderResults(id);

            Providers = results.Content;
            return Page();
        }
    }
}