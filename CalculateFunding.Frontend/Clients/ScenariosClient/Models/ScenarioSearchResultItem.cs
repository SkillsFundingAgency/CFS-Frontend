namespace CalculateFunding.Frontend.Clients.ScenariosClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using System;
    public class ScenarioSearchResultItem : Reference
    {
        public string TestDescription { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string PeriodName { get; set; }

        public string PeriodId { get; set; }

        public string FundingStreamName { get; set; }

        public string FundingStreamId { get; set; }

        public string Status { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}
