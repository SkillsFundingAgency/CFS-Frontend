using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http;
using System.Threading.Tasks;
using Allocations.Web.ApiClient;
using Allocations.Web.ApiClient.Models;
using Newtonsoft.Json;

namespace Allocations.Web.Pages
{
    public class IndexModel : PageModel
    {
        private readonly AllocationsApiClient _apiClient;
        public IList<BudgetSummary> Rootobjects;

        public IndexModel(AllocationsApiClient apiClient)
        {
            _apiClient = apiClient;
        }

        public async Task<IActionResult> OnGetAsync()
        {
            var results = await _apiClient.GetBudgetResults();

            Rootobjects = results.Content;
            return Page();
        }
    }

    public class TestSummary
    {
        public int Passed { get; set; }
        public int Failed { get; set; }
        public int Ignored { get; set; }
        public int TotalCovered { get; set; }
    }

    public class AllocationLine
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public double TotalAmount { get; set; }
        public TestSummary TestSummary { get; set; }
    }

    public class FundingPolicy
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public IList<AllocationLine> AllocationLines { get; set; }
        public double TotalAmount { get; set; }
        public TestSummary TestSummary { get; set; }
    }
    public class BudgetSummary
    {
        public Reference Budget { get; set; }
        public IList<FundingPolicy> FundingPolicies { get; set; }
        public int TotalProviders { get; set; }
        public double TotalAmount { get; set; }
        public TestSummary TestSummary { get; set; }
    }
}
