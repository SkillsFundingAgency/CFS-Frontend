using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.ResultsClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Results.Products
{
    public class IndexModel : PageModel
    {
        private readonly IResultsApiClient _resultsClient;
        public AllocationLine AllocationLine;
        public string BudgetId;

        public IndexModel(IResultsApiClient resultsApiClient)
        {
            _resultsClient = resultsApiClient;
        }

        public async Task<IActionResult> OnGetAsync(string budgetId, string allocationLineId)
        {
            var results = await _resultsClient.GetAllocationLine(budgetId, allocationLineId);

            AllocationLine = results.Content;
            BudgetId = budgetId;
            return Page();
        }
    }
}
