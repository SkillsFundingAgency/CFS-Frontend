using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Datasets
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