using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CalculateFunding.Frontend.Clients.Models;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class Product : ResultSummary
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public Reference AllocationLine { get; set; }

        public ProductCalculation Calculation { get; set; }
        public List<ProductTestScenario> TestScenarios { get; set; }
        public Reference[] TestProviders { get; set; }
    }
}
