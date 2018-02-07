using System.Collections.Generic;
using CalculateFunding.Frontend.Clients.CommonModels;

namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public class BudgetSummary : ResultSummary
    {
        public Reference Budget { get; set; }
        public List<FundingPolicySummary> FundingPolicies { get; set; }
    }
}