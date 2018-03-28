namespace CalculateFunding.Frontend.Clients.ScenariosClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using System;
    public class ScenarioSearchResultItem : Reference
    {
        public string TestDescription { get; set; }

        public string SpecificationName { get; set; }

        public string PeriodName { get; set; }

        public string FundingStreamName { get; set; }

        public string Status { get; set; }

        public DateTime LastUpdatedDate { get; set; }
    }
}
