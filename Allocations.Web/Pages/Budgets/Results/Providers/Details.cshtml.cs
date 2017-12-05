using System.Threading.Tasks;
using CalculateFunding.Web.ApiClient;
using CalculateFunding.Web.ApiClient.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Web.Pages.Budgets.Results.Providers
{
    public class DetailsModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;
        public ProviderTestResult Provider { get; set; }

        public DetailsModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }

        public async Task<IActionResult> OnGetAsync(string id, string providerId)
        {
            var result = await _apiClient.GetProviderResult(id, providerId);

            Provider = result.Content;

            return Page();
        }


    }
    }