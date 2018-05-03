namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using System;

    public class CalculationSearchResultItem : Reference
    {
        public string SpecificationName { get; set; }

        public string PeriodName { get; set; }

        public string Status { get; set; }

        public string CalculationType { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }
    }
}