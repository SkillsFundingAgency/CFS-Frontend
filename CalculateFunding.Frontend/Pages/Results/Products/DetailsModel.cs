using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.ApiClient;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Results.Products
{
    public class DetailsModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly ICalculationsApiClient _calculationsClient;

        public DetailsModel(ISpecsApiClient apiClient, ICalculationsApiClient calculationsClient)
        {
            _specsClient = apiClient;
            _calculationsClient = calculationsClient;
        }
        public async Task OnGet(string id, string productId)
        {
            Budget = (await _specsClient.GetBudget(id))?.Content;

            //Product = Budget.FundingPolicies
            //    .SelectMany(x => x.AllocationLines.SelectMany(y =>
            //        y.ProductFolders.SelectMany(z => z.Products).Where(p => p.Id == productId))).FirstOrDefault();

            var response = await _calculationsClient.PostPreview(new PreviewRequest
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
            Budget = (await _specsClient.GetBudget(id))?.Content;

            //Product = Budget.FundingPolicies
            //    .SelectMany(x => x.AllocationLines.SelectMany(y => y.ProductFolders.SelectMany(z => z.Products)))
            //    .Skip(1).FirstOrDefault();


            var response = await _calculationsClient.PostPreview(new PreviewRequest
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

        public ApiClient.Models.Specification Budget { get; set; }
        public Product Product { get; set; }
        public List<ProviderTestResult> TestResults { get; set; }
    }
}