using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Allocations.Web.ApiClient;
using Allocations.Web.ApiClient.Models.Results;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Allocations.Web.ApiClient.Models;

namespace Allocations.Web.Pages.Products
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
