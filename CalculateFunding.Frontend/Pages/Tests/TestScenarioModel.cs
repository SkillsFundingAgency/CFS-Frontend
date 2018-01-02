using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Tests
{
    public class TestScenarioModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;

        public TestScenarioModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;

            Operators = Enum.GetValues(typeof(ComparisonOperator)).Cast<ComparisonOperator>().ToList();
        } 

        public List<ComparisonOperator> Operators { get; }
        public ApiClient.Models.Specification Budget { get; private set; }
        public Product Product { get; private set; }

        [BindProperty]
        public ProductTestScenario TestScenario { get; set; }

        public async Task OnGet(string budgetId, string productId)
        {
            Budget = (await _apiClient.GetBudget(budgetId))?.Content;
            Product = (await _apiClient.GetProduct(budgetId, productId))?.Content;


            TestScenario = new ProductTestScenario
            {
                Id = Guid.NewGuid().ToString("N"),
                GivenSteps = new List<GivenStep>
                {
                    new GivenStep(),
                    new GivenStep(),
                    new GivenStep(),
                    new GivenStep(),
                    new GivenStep(),
                    new GivenStep(),
                    new GivenStep(),
                    new GivenStep(),
                    new GivenStep(),
                    new GivenStep(),
                },
                ThenSteps = new List<ThenStep>
                {
                    new ThenStep(),
                    new ThenStep(),
                    new ThenStep(),
                    new ThenStep(),
                    new ThenStep(),
                    new ThenStep(),
                    new ThenStep(),
                    new ThenStep(),
                    new ThenStep(),
                    new ThenStep(),
                }
            };
        }

        public async Task OnPost(string budgetId, string productId)
        {
            Budget = (await _apiClient.GetBudget(budgetId))?.Content;
            Product = (await _apiClient.GetProduct(budgetId, productId))?.Content;


            var i = 0;
            foreach (var givenStep in TestScenario.GivenSteps)
            {
                if (!string.IsNullOrWhiteSpace(givenStep.Field) && !string.IsNullOrWhiteSpace(givenStep.Value))
                {
                    var split = givenStep.Field.Split('|');
                   /// var dataset = Budget?.DatasetDefinitions.FirstOrDefault(x => x.Id == split[0]);
                   // var field = dataset?.FieldDefinitions.FirstOrDefault(x => x.Id == split[1]);
                   // if (field != null)
                   // {

                   //     //givenStep.Field = field.Id;
                   //     givenStep.Value = ValidateFieldType(field.Type, givenStep.Value, i);
                   // }
                }
                i++;
            }

            i = 0;
            foreach (var thenStep in TestScenario.ThenSteps)
            {
                if (!string.IsNullOrWhiteSpace(thenStep.Value))
                {
                    thenStep.Value = ValidateFieldType(FieldType.Decimal, thenStep.Value, i);
                }
                i++;
            }

            if (ModelState.IsValid)
            {

                foreach (var givenStep in TestScenario.GivenSteps)
                {
                    if (!string.IsNullOrWhiteSpace(givenStep.Field) && !string.IsNullOrWhiteSpace(givenStep.Value))
                    {
                        var split = givenStep.Field.Split('|');
                        //var dataset = Budget?.DatasetDefinitions.FirstOrDefault(x => x.Id == split[0]);
                        //var field = dataset?.FieldDefinitions.FirstOrDefault(x => x.Id == split[1]);
                        //if (field != null)
                        //{
                        //    givenStep.Dataset = dataset.Id;
                        //    givenStep.Field = field.Id;
                        //}
                        givenStep.StepType = TestStepType.GivenSourceField;
                    }
                }

                foreach (var thenStep in TestScenario.ThenSteps)
                {
                    thenStep.StepType = TestStepType.ThenProductValue;
                }

                var existing = Product.TestScenarios.FirstOrDefault(x => x.Id == TestScenario.Id);
                if (existing != null)
                {
                    existing.Name = TestScenario.Name;
                    existing.GivenSteps = TestScenario.GivenSteps.Where(x =>
                        !string.IsNullOrEmpty(x.Field) &&
                        !string.IsNullOrEmpty(x.Value)).ToList();
                    existing.ThenSteps = TestScenario.ThenSteps.Where(x =>
                        !string.IsNullOrEmpty(x.Value)).ToList();
                }
                else
                {
                    Product.TestScenarios.Add(TestScenario);
                }

                var response = await _apiClient.PostPreview(new PreviewRequest
                {
                    BudgetId = Budget.Id,
                    ProductId = Product.Id,
                    TestScenario = TestScenario
                });

                Preview = response.Content;
                // to save: var result = await _apiClient.PostProduct(budgetId, Product);
            }
        }

        public PreviewResponse Preview { get; set; }

        private string ValidateFieldType(FieldType fieldType, string value, int i)
        {
            switch (fieldType)
            {
                case FieldType.DateTime:
                    if (!DateTime.TryParse(value, new CultureInfo("en-GB"),
                        DateTimeStyles.AssumeLocal, out var date))
                    {
                        ModelState.AddModelError($"TestScenario.GivenStep[{i}]", $"{value} is not a valid date");
                    }
                    else
                    {
                        return date.ToString("dd/MM/yyyy");
                    }
                    break;
                case FieldType.Decimal:
                    if (!Decimal.TryParse(value, NumberStyles.Any, new CultureInfo("en-GB"), out var dec))
                    {
                        ModelState.AddModelError($"TestScenario.GivenStep[{i}]", $"{value} is not a valid decimal");
                    }
                    else
                    {
                        return dec.ToString("0.00");
                    }
                    break;
                case FieldType.Integer:
                    if (!long.TryParse(value, NumberStyles.Any, new CultureInfo("en-GB"), out var lng))
                    {
                        ModelState.AddModelError($"TestScenario.GivenStep[{i}]", $"{value} is not a valid integer");
                    }
                    else
                    {
                        return lng.ToString("0.00");
                    }
                    break;
            
            }
            return value;
        }
    }
}