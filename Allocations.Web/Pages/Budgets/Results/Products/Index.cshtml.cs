using System.Threading.Tasks;
using CalculateFunding.Web.ApiClient;
using CalculateFunding.Web.ApiClient.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Web.Pages.Budgets.Results.Products
{
    public class IndexModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;
        public AllocationLine AllocationLine;
        public string BudgetId;

        public IndexModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }

        public async Task<IActionResult> OnGetAsync(string budgetId, string allocationLineId)
        {
            var results = await _apiClient.GetAllocationLine(budgetId, allocationLineId);

            AllocationLine = results.Content;
            BudgetId = budgetId;
            return Page();
        }
    }
}
