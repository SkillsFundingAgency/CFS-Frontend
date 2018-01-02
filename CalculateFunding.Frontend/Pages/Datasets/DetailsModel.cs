using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.APiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Datasets
{
    public class DetailsModel : PageModel
    {
        private readonly IAllocationsApiClient _apiClient;
        public ProviderTestResult Provider { get; set; }

        public DetailsModel(IAllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }

        public async Task<IActionResult> OnGetAsync(string id, string providerId)
        {
            var result = await _apiClient.GetProviderResult(id, providerId).ConfigureAwait(false);

            Provider = result.Content;

            return Page();
        }


    }
    }