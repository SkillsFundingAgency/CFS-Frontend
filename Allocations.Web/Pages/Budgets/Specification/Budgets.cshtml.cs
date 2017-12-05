using System.Threading.Tasks;
using CalculateFunding.Web.ApiClient;
using CalculateFunding.Web.ApiClient.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Web.Pages.Budgets.Specification
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