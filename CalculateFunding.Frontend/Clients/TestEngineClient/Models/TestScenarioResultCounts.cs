using System;

namespace CalculateFunding.Frontend.Clients.TestEngineClient.Models
{
    public class TestScenarioResultCounts
    {
        public string TestScenarioId { get; set; }

        public string TestScenarioName { get; set; }

        public int Passed { get; set; }

        public int Failed { get; set; }

        public int Ignored { get; set; }

        public DateTimeOffset? LastUpdatedDate { get; set; }

        public decimal TestCoverage
        {
            get
            {
                int totalRecords = Passed + Failed + Ignored;
                if (totalRecords == 0)
                {
                    return 0;
                }

                return Math.Round((decimal)(Passed + Failed) / totalRecords * 100, 1);
            }
        }
    }
}
