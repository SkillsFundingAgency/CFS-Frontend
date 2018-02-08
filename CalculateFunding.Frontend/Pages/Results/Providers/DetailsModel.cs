namespace CalculateFunding.Frontend.Pages.Results.Providers
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class DetailsModel : PageModel
    {
        private readonly IResultsApiClient _resultsClient;

        public DetailsModel(IResultsApiClient resultsClient)
        {
            _resultsClient = resultsClient;
        }

        public ProviderTestResult Provider { get; set; }

        public async Task<IActionResult> OnGetAsync(string id, string providerId)
        {
            var result = await _resultsClient.GetProviderResult(id, providerId);

            Provider = result.Content;

            return Page();
        }
    }
}