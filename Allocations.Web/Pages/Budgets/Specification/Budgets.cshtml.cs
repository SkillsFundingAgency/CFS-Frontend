using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Allocations.Web.ApiClient;
using Allocations.Web.ApiClient.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Allocations.Web.Pages.Specifications
{
    public class BudgetsModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;

        public BudgetsModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }
        public async Task OnGet()
        {
            Budgets = (await _apiClient.GetBudgets())?.Content;
        }

        public Budget[] Budgets { get; set; }
    }
}