namespace CalculateFunding.Frontend.ViewModels.Scenarios
{
    using CalculateFunding.Frontend.ViewModels.Common;
    using System;
    using System.Collections.Generic;

    public class ScenarioSearchResultItemViewModel : ReferenceViewModel
    {
        public string Description { get; set; }

        public string SpecificationName { get; set; }

        public string PeriodName { get; set; }

        public IEnumerable<string> FundingStreamNames { get; set; }

        public string Status { get; set; }

        public DateTime LastUpdatedDate { get; set; }

        public string LastUpdatedDateDisplay { get; set; }
    }
}
