using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.APiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Results.Products
{
    public class IndexModel : PageModel
    {
        private readonly IAllocationsApiClient _apiClient;
        public AllocationLine AllocationLine;
        public string BudgetId;

        public IndexModel(IAllocationsApiClient apiClient)
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
