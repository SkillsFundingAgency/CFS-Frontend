namespace CalculateFunding.Frontend.Pages.Results
{
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.ResultsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class AllocationOverview : PageModel
    {
        private readonly IResultsApiClient _apiClient;

        public AllocationOverview(IResultsApiClient apiClient)
        {
            _apiClient = apiClient;
        }

        public IEnumerable<BudgetSummary> Budgets { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            var results = await _apiClient.GetBudgetResults(HttpContext.RequestAborted).ConfigureAwait(false);

            ////Ignore this just testing stuff without a valid url
            Budgets = results.Content ?? new List<BudgetSummary>().ToArray();

            return Page();
        }
    }
}
