namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    using System.Collections.Generic;

    public class FundingPolicySummary : ResultSummary
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public List<AllocationLineSummary> AllocationLines { get; set; }
    }
}
