namespace CalculateFunding.Frontend.Clients.PreviewClient.Models
{
    public abstract class ResultSummary
    {
        public int TotalProviders { get; set; }
        public decimal TotalAmount { get; set; }
        public TestSummary TestSummary { get; set; }    
    }
}