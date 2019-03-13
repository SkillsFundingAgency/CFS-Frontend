namespace CalculateFunding.Frontend.Clients.CalcsClient.Models
{
    using System;
    using CalculateFunding.Common.Models;

    public class CalculationSearchResultItem : Reference
    {
        public string SpecificationName { get; set; }

        public string FundingPeriodName { get; set; }

        public string Status { get; set; }

        public string CalculationType { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }
    }
}