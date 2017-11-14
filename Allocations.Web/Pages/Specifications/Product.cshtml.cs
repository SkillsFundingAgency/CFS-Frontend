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
    public class ProductModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;

        public ProductModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }
        public async Task OnGet(string id)
        {
            Budget = (await _apiClient.GetBudget(id))?.Content;

            Product = Budget.FundingPolicies
                .SelectMany(x => x.AllocationLines.SelectMany(y => y.ProductFolders.SelectMany(z => z.Products)))
                .Skip(1).FirstOrDefault();

            var response = (await _apiClient.PostAsync<PreviewResponse, PreviewRequest>("api/v1/engine/preview",
                new PreviewRequest
                {
                    BudgetId = Budget.Id,
                    ProductId = Product.Id,
                    Calculation = Product.Calculation?.SourceCode
                }));

            Preview = response.Content;
        }

        public async Task OnPost(string id, string calculation)
        {
            Budget = (await _apiClient.GetBudget(id))?.Content;

            Product = Budget.FundingPolicies
                .SelectMany(x => x.AllocationLines.SelectMany(y => y.ProductFolders.SelectMany(z => z.Products)))
                .Skip(1).FirstOrDefault();

            var response = (await _apiClient.PostAsync<PreviewResponse, PreviewRequest>("api/v1/engine/preview",
                new PreviewRequest
                {
                    BudgetId = Budget.Id,
                    ProductId = Product.Id,
                    Calculation = calculation ?? Product.Calculation?.SourceCode
                }));

            Preview = response.Content;
        }

        public PreviewResponse Preview { get; set; }

        public Budget Budget { get; set; }
        public Product Product { get; set; }
    }
}