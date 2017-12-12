using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Budgets.Specification
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

        public ApiClient.Models.Specification[] Budgets { get; set; }
    }
}