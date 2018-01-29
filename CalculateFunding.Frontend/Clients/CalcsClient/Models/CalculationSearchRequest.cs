namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    internal class CalculationSearchRequest
    {
        public int PageNumber { get; set; }

        public int Top { get; set; }

        public string SearchTerm { get; set; }
    }
}
