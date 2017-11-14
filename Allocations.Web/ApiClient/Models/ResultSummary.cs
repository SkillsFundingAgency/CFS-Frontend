namespace Allocations.Web.ApiClient.Models
{
    public abstract class ResultSummary
    {

        public decimal TotalAmount { get; set; }
        public TestSummary TestSummary { get; set; }
    }
}