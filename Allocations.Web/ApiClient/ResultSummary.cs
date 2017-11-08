namespace Allocations.Web.ApiClient
{
    public abstract class ResultSummary
    {

        public decimal TotalAmount { get; set; }
        public TestSummary TestSummary { get; set; }
    }
}