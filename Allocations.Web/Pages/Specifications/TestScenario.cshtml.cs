using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Allocations.Web.ApiClient;
using Allocations.Web.ApiClient.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Allocations.Web.Pages.Specifications
{
    public class GivenStep
    {
        public string DatasetId { get; set; }
        public string FieldId { get; set; }
        public string Operator { get; set; }
        public string Value { get; set; }
    }

    public class ThenStep
    {
        public string Operator { get; set; }
        public string Value { get; set; }
    }

    public class TestScenarioViewModel
    {

        [Required]
        public string Name { get; set; }

        public List<GivenStep> GivenSteps { get; set;}
        public List<ThenStep> ThenSteps { get; set; }
    }
    public class TestScenarioModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;

        public TestScenarioModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
            Operators = new List<string>
            {
                "is equal to",
                "is not equal to",
                "is greater than",
                "is greater than or equal to",
                "is less than",
                "is less than or equal to"
            };
        } 

        public List<string> Operators { get; }
        public Budget Budget { get; private set; }
        public Product Product { get; private set; }
        public TestScenarioViewModel TestScenarioViewModel { get; private set; }

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

            TestScenarioViewModel = new TestScenarioViewModel();
        }
    }
}