using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient.Models;
using CalculateFunding.Frontend.Interfaces.APiClient;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Calcs
{
    public class ProductModel : PageModel
    {
        private readonly ICalculationsApiClient _calculationsClient;
        private readonly ISpecsApiClient _specsClient;

        public ProductModel(ICalculationsApiClient calculationsClient, ISpecsApiClient specsClient)
        {
            _calculationsClient = calculationsClient;
            _specsClient = specsClient;
        }
        public async Task OnGet(string id, string productId)
        {
            Budget = (await _specsClient.GetBudget(id))?.Content;


            var response = await _calculationsClient.PostPreview(new PreviewRequest
            {
                BudgetId = Budget.Id,
                ProductId = Product.Id,
                Calculation = Product.Calculation?.SourceCode
            });

            Preview = response.Content;
        }

        public async Task OnPost(string id, string calculation)
        {
            Budget = (await _specsClient.GetBudget(id))?.Content;


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

        public Specification Budget { get; set; }

        public Product Product { get; set; }
    }
}