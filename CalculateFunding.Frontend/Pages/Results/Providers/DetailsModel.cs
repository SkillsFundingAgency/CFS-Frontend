using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Results.Providers
{
    public class DetailsModel : PageModel
    {
        private readonly IResultsApiClient _resultsClient;
        public ProviderTestResult Provider { get; set; }

        public DetailsModel(IResultsApiClient resultsClient)
        {
            _resultsClient = resultsClient;
        }

        public async Task<IActionResult> OnGetAsync(string id, string providerId)
        {
            var result = await _resultsClient.GetProviderResult(id, providerId);

            Provider = result.Content;

            return Page();
        }
    }
}