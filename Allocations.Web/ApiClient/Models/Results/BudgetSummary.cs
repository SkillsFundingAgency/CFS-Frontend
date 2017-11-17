using System.Collections.Generic;

namespace Allocations.Web.ApiClient.Models.Results
{
    public class BudgetSummary : ResultSummary
    {
        public Reference Budget { get; set; }
        public List<FundingPolicySummary> FundingPolicies { get; set; }
    }
}