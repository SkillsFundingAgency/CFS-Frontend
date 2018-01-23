using CalculateFunding.Frontend.Clients.Models;

namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    public class CalculationSearchResult : Reference
    {
        public string Description { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string PeriodName { get; set; }
    }
}