using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.ApiClient;
using CalculateFunding.Frontend.ApiClient.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace CalculateFunding.Frontend.Pages.Results.Providers
{
    public class IndexModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;
        public IList<ProviderTestResult> Providers { get; set; }

        public IndexModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }

        public async Task<IActionResult> OnGetAsync(string id)
        {
            var results = await _apiClient.GetProviderResults(id);

            Providers = results?.Content?.Where(x => x.ScenarioResults.Any(sr => sr.TestResult == TestResult.Failed)).ToList();

            var datasetNames = new List<string>();
            var fieldNames = new List<string>();
            var fieldValues = new List<string>();
            foreach (var provider in Providers)
            {
                provider.ScenarioResults = provider.ScenarioResults.Where(sr => sr.TestResult == TestResult.Failed).ToArray();

                var datasetReferences = provider.ScenarioResults.Where(sr => sr.DatasetReferences != null)
                    .SelectMany(sr => sr.DatasetReferences);

                datasetNames.AddRange(datasetReferences.Select(x => x.DatasetName).Distinct());
                fieldNames.AddRange(datasetReferences.Select(x => x.FieldName).Distinct());
                fieldValues.AddRange(datasetReferences.Select(x => x.Value).Distinct());


            }

            DatasetNames = datasetNames.GroupBy(x => x).ToDictionary(x => x.Key);
            DatasetFieldNames = fieldNames.GroupBy(x => x).ToDictionary(x => x.Key);
            DatasetFieldValues = fieldValues.GroupBy(x => x).ToDictionary(x => x.Key);
            return Page();
        }

        public Dictionary<string, IGrouping<string, string>> DatasetFieldValues { get; set; }

        public Dictionary<string, IGrouping<string, string>> DatasetFieldNames { get; set; }

        public Dictionary<string, IGrouping<string, string>> DatasetNames { get; set; }
    }
}