namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    using System.Collections.Generic;
    using CalculateFunding.Frontend.Clients.CommonModels;

    public class BudgetSummary : ResultSummary
    {
        public Reference Budget { get; set; }

        public List<FundingPolicySummary> FundingPolicies { get; set; }
    }
}