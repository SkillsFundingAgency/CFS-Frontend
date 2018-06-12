using System;

namespace CalculateFunding.Frontend.Clients.TestEngineClient.Models
{
    public class TestScenarioResultCounts : ResultCounts
    {
        public string TestScenarioId { get; set; }

        public string TestScenarioName { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }
    }
}
