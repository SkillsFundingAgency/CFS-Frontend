namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    public class CalculationStatusCounts
    {
        public string SpecificationId { get; set; }

        public int Approved { get; set; }

        public int Updated { get; set; }

        public int Draft { get; set; }

        public int Total { get; set; }
    }
}
