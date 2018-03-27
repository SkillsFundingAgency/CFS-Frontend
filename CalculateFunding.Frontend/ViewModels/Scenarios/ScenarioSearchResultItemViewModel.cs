namespace CalculateFunding.Frontend.ViewModels.Scenarios
{
    using CalculateFunding.Frontend.ViewModels.Common;
    using System;
    public class ScenarioSearchResultItemViewModel : ReferenceViewModel
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

        public string LastUpdatedDisplay { get; set; }
    }
}
