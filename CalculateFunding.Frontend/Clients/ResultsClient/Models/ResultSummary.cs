namespace CalculateFunding.Frontend.Clients.ResultsClient.Models
{
    public abstract class ResultSummary
    {
        public int TotalProviders { get; set; }

        public decimal TotalAmount { get; set; }

        public TestSummary TestSummary { get; set; }
    }
}