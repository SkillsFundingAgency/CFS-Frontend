using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Budgets.Specification
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