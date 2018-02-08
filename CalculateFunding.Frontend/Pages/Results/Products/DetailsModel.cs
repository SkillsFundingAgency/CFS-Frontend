namespace CalculateFunding.Frontend.Pages.Results.Products
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.PreviewClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class DetailsModel : PageModel
    {
        private readonly ISpecsApiClient _specsClient;
        private readonly IPreviewApiClient _previewClient;

        public DetailsModel(ISpecsApiClient apiClient, IPreviewApiClient previewClient)
        {
            _specsClient = apiClient;
            _previewClient = previewClient;
        }

        public PreviewResponse Preview { get; set; }

        public Specification Budget { get; set; }

        public Clients.PreviewClient.Models.Product Product { get; set; }

        public List<ProviderTestResult> TestResults { get; set; }

        public async Task OnGet(string id, string productId)
        {
            Budget = (await _specsClient.GetSpecification(id))?.Content;

            //// Product = Budget.FundingPolicies
            ////    .SelectMany(x => x.AllocationLines.SelectMany(y =>
            ////        y.ProductFolders.SelectMany(z => z.Products).Where(p => p.Id == productId))).FirstOrDefault();

            var response = await _previewClient.PostPreview(new PreviewRequest
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
            Budget = (await _specsClient.GetSpecification(id))?.Content;

            ////Product = Budget.FundingPolicies
            ////    .SelectMany(x => x.AllocationLines.SelectMany(y => y.ProductFolders.SelectMany(z => z.Products)))
            ////    .Skip(1).FirstOrDefault();

            var response = await _previewClient.PostPreview(new PreviewRequest
            {
                BudgetId = Budget.Id,
                ProductId = Product.Id,
                Calculation = calculation ?? Product.Calculation?.SourceCode
            });

            if (!string.IsNullOrEmpty(calculation))
            {
                Product.Calculation = new Clients.PreviewClient.Models.ProductCalculation { SourceCode = calculation };
            }

            Preview = response.Content;
        }
    }
}