namespace CalculateFunding.Frontend.ViewModels.TestEngine
{
    using System;

    public class TestScenarioSearchResultItemViewModel 
    {
        public string Id { get; set; }

        public string TestResult { get; set; }

        public string SpecificationId { get; set; }

        public string SpecificationName { get; set; }

        public string TestScenarioId { get; set; }

        public string TestScenarioName { get; set; }

        public string ProviderId { get; set; }

        public string ProviderName { get; set; }

        public DateTime? LastUpdatedDate { get; set; }

        public string LastUpdatedDateDisplay { get; set; }

    }
}
