namespace CalculateFunding.Frontend.ViewModels.Scenarios
{
    using CalculateFunding.Frontend.ViewModels.Common;
    using System;
    public class ScenarioSearchResultItemViewModel : ReferenceViewModel
    {
        public string TestDescription { get; set; }

        public string SpecificationName { get; set; }

        public string PeriodName { get; set; }

        public string FundingStreamName { get; set; }

        public string Status { get; set; }

        public DateTime LastUpdatedDate { get; set; }

        public string LastUpdatedDateDisplay { get; set; }
    }
}
