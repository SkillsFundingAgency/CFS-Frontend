namespace Allocations.Web.ApiClient
{
    public class BudgetSummary : ResultSummary
    {
        public Reference Budget { get; set; }
        public FundingPolicySummary[] FundingPolicies { get; set; }
    }
}