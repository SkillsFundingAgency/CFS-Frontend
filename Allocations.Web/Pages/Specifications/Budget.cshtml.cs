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
    public class BudgetModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;

        public BudgetModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }
        public async Task OnGet(string id)
        {
            Budget = (await _apiClient.GetBudget(id))?.Content;
        }

        public Budget Budget { get; set; }
    }
}