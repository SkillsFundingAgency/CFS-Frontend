namespace CalculateFunding.Frontend.Clients.ScenariosClient.Models
{
    using System;
    using System.Collections.Generic;
    using CalculateFunding.Common.Models;

    public class ScenarioSearchResultItem : Reference
    {
        public string Description { get; set; }

        public string SpecificationName { get; set; }

        public string FundingPeriodName { get; set; }

        public IEnumerable<string> FundingStreamNames { get; set; }

        public string Status { get; set; }

        public DateTime LastUpdatedDate { get; set; }
    }
}
