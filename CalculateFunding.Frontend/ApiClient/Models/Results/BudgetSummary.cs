using System.Collections.Generic;

namespace CalculateFunding.Frontend.ApiClient.Models.Results
{
    public class BudgetSummary : ResultSummary
    {
        public Reference Budget { get; set; }
        public List<FundingPolicySummary> FundingPolicies { get; set; }
    }
}