using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using Allocations.Web.ApiClient;
using Allocations.Web.ApiClient.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualBasic.CompilerServices;

namespace Allocations.Web.Pages.Specifications
{
    public class TestScenarioModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;

        public TestScenarioModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;


                var t = typeof(ComparisonOperator);
            Operators = Enum.GetValues(t).Cast<Enum>().Select(x => t.GetMember(x.ToString()).FirstOrDefault()?.GetCustomAttributes(false).OfType<EnumMemberAttribute>().Select(em => em.Value).FirstOrDefault()).ToList();
        } 

        public List<string> Operators { get; }
        public Budget Budget { get; private set; }
        public Product Product { get; private set; }

        [BindProperty]
        public ProductTestScenario TestScenario { get; set; }

        public async Task OnGet(string id)
        {
            Budget = (await _apiClient.GetBudget(id))?.Content;


            Product = Budget.FundingPolicies
                .SelectMany(x => x.AllocationLines.SelectMany(y => y.ProductFolders.SelectMany(z => z.Products)))
                .Skip(1).FirstOrDefault();


            TestScenario = new ProductTestScenario
            {
                Id = Guid.NewGuid().ToString("N"),
                GivenSteps = new List<GivenStep>
                {
                    new GivenStep(),
                    new GivenStep(),
                },
                ThenSteps = new List<ThenStep>
                {
                    new ThenStep(),
                    new ThenStep(),
                }
            };
        }

        public async Task OnPost(string id)
        {

            //if (ModelState.IsValid)
            {
                TestScenario.GivenSteps = TestScenario.GivenSteps.Where(x =>
                    !string.IsNullOrEmpty(x.Field) &&
                    !string.IsNullOrEmpty(x.Value)).ToList();

                foreach (var givenStep in TestScenario.GivenSteps)
                {
                    var split = givenStep.Field.Split('|');
                    givenStep.Dataset = split[0].Trim();
                    givenStep.Field = split[1].Trim();
                }

                TestScenario.ThenSteps = TestScenario.ThenSteps.Where(x =>
                    !string.IsNullOrEmpty(x.Value)).ToList();

                Budget = (await _apiClient.GetBudget(id))?.Content;

                Product = Budget.FundingPolicies
                    .SelectMany(x => x.AllocationLines.SelectMany(y => y.ProductFolders.SelectMany(z => z.Products)))
                    .Skip(1).FirstOrDefault();

                var existing = Product.TestScenarios.FirstOrDefault(x => x.Id == TestScenario.Id);
                if (existing != null)
                {
                    existing.Name = TestScenario.Name;
                    existing.GivenSteps = TestScenario.GivenSteps;
                    existing.ThenSteps = TestScenario.ThenSteps;
                }
                else
                {
                    Product.TestScenarios.Add(TestScenario);
                }
                var result = await _apiClient.PostBudget(Budget);
            }
        }

        public List<string> DatasetNames { get; set; }
    }
}