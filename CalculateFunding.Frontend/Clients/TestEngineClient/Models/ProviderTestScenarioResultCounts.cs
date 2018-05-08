namespace CalculateFunding.Frontend.Clients.TestEngineClient.Models
{
    public class ProviderTestScenarioResultCounts
    {
        public string ProviderId { get; set; }

        public int Passed { get; set; }

        public int Failed { get; set; }

        public int Ignored { get; set; }

        public decimal TestCoverage { get; set; }
    }
}
