using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Budgets.Results.Products
{
    public class DetailsModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;

        public DetailsModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }
        public async Task OnGet(string id, string productId)
        {
            Budget = (await _apiClient.GetBudget(id))?.Content;

            Product = Budget.FundingPolicies
                .SelectMany(x => x.AllocationLines.SelectMany(y =>
                    y.ProductFolders.SelectMany(z => z.Products).Where(p => p.Id == productId))).FirstOrDefault();

            var response = await _apiClient.PostPreview(new PreviewRequest
            {
                BudgetId = Budget.Id,
                ProductId = Product.Id,
                Calculation = Product.Calculation?.SourceCode
            });

            Preview = response.Content;
            TestResults = Preview.TestResults;
            var resultsByAllocation1 = TestResults.SelectMany(x => x.ScenarioResults.GroupBy(s => s.Scenario)).ToDictionary(s => s.Key);
            var resultsByAllocation = TestResults.GroupBy(x => new { x.ScenarioResults, x.Provider.Id }).ToDictionary(x => x.Key);
        }

        public async Task OnPost(string id, string calculation)
        {
            Budget = (await _apiClient.GetBudget(id))?.Content;

            Product = Budget.FundingPolicies
                .SelectMany(x => x.AllocationLines.SelectMany(y => y.ProductFolders.SelectMany(z => z.Products)))
                .Skip(1).FirstOrDefault();


            var response = await _apiClient.PostPreview(new PreviewRequest
            {
                BudgetId = Budget.Id,
                ProductId = Product.Id,
                Calculation = calculation ?? Product.Calculation?.SourceCode
            });

            if (!string.IsNullOrEmpty(calculation))
            {
                Product.Calculation = new ProductCalculation { SourceCode = calculation };
            }

            Preview = response.Content;
        }

        public PreviewResponse Preview { get; set; }

        public Budget Budget { get; set; }
        public Product Product { get; set; }
        public List<ProviderTestResult> TestResults { get; set; }
    }
}