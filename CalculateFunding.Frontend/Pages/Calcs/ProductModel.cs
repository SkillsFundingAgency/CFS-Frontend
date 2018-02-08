namespace CalculateFunding.Frontend.Pages.Calcs
{
    using System.Threading.Tasks;
    using CalculateFunding.Frontend.Clients.PreviewClient.Models;
    using CalculateFunding.Frontend.Clients.SpecsClient.Models;
    using CalculateFunding.Frontend.Interfaces.ApiClient;
    using Microsoft.AspNetCore.Mvc.RazorPages;

    public class ProductModel : PageModel
    {
        private readonly ICalculationsApiClient _calculationsClient;
        private readonly ISpecsApiClient _specsClient;

        public ProductModel(ICalculationsApiClient calculationsClient, ISpecsApiClient specsClient)
        {
            _calculationsClient = calculationsClient;
            _specsClient = specsClient;
        }

        public PreviewResponse Preview { get; set; }

        public Specification Budget { get; set; }

        public Clients.PreviewClient.Models.Product Product { get; set; }

        public async Task OnGet(string id, string productId)
        {
            Budget = (await _specsClient.GetSpecification(id))?.Content;

           // //var response = await _calculationsClient.PostPreview(new PreviewRequest
           // //{
           // //    BudgetId = Budget.Id,
           // //    ProductId = Product.Id,
           // //    Calculation = Product.Calculation?.SourceCode
           // //});

           //// Preview = response.Content;
        }

        public void OnPost(string id, string calculation)
        {
            ////Budget = (await _specsClient.GetSpecification(id))?.Content;

            ////var response = await _calculationsClient.PostPreview(new PreviewRequest
            ////{
            ////    BudgetId = Budget.Id,
            ////    ProductId = Product.Id,
            ////    Calculation = calculation ?? Product.Calculation?.SourceCode
            ////});

            ////if (!string.IsNullOrEmpty(calculation))
            ////{
            ////    Product.Calculation = new ProductCalculation { SourceCode = calculation };
            ////}

            ////Preview = response.Content;
        }
    }
}