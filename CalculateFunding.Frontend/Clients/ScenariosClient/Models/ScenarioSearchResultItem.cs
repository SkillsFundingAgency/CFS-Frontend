namespace CalculateFunding.Frontend.Clients.ScenariosClient.Models
{
    using CalculateFunding.Frontend.Clients.CommonModels;
    using System;
    using System.Collections.Generic;

    public class ScenarioSearchResultItem : Reference
    {
        public string Description { get; set; }

        public string SpecificationName { get; set; }

        public string PeriodName { get; set; }

        public IEnumerable<string> FundingStreamNames { get; set; }

        public string Status { get; set; }

        public DateTime LastUpdatedDate { get; set; }
    }
}
