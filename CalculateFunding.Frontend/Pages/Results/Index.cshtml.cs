using System.Collections.Generic;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Budgets.Results
{
    public class IndexModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;
        public IList<BudgetSummary> Budgets;

        public IndexModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }

       

        public async Task<IActionResult> OnGetAsync()
        {
            var results = await _apiClient.GetBudgetResults();

            Budgets = results.Content;
            return Page();
        }
    }

}
