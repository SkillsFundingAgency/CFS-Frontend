using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Allocations.Web.Pages
{
    public class IndexModel : PageModel
    {
        public IList<RootObject> Rootobjects;

        public async Task<IActionResult> OnGetAsync()
        {
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri("http://localhost:7071");

                //HTTP GET
                var responseTask = await client.GetStringAsync("/api/budgets");
                var results = JsonConvert.DeserializeObject<List<RootObject>>(responseTask);
                Rootobjects = results;
            }
            return Page();
        }
    }

    public class Budget
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

    public class TestSummary
    {
        public int Passed { get; set; }
        public int Failed { get; set; }
        public int Ignored { get; set; }
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
    public class RootObject
    {
        public Budget Budget { get; set; }
        public IList<FundingPolicy> FundingPolicies { get; set; }
        public double TotalAmount { get; set; }
        public TestSummary TestSummary { get; set; }
    }
}
