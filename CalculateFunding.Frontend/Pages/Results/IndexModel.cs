using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using CalculateFunding.Frontend.Interfaces.APiClient;

namespace CalculateFunding.Frontend.Pages.Results
{
    public class IndexModel : PageModel
    {
        readonly IBudgetApiClient _apiClient;

        public IEnumerable<BudgetSummary> Budgets;

        public IndexModel(IBudgetApiClient apiClient)
        {
            _apiClient = apiClient;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var results = await _apiClient.GetBudgetResults(HttpContext.RequestAborted).ConfigureAwait(false);

            //Ignore this just testing stuff without a valid url
            Budgets = results.Content != null ? results.Content : new List<BudgetSummary>();

            return Page();
        }
    }

}
