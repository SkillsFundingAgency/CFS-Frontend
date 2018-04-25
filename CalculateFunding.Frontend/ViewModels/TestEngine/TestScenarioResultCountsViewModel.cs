using System;

namespace CalculateFunding.Frontend.ViewModels.TestEngine
{
    public class TestScenarioResultCountsViewModel
    {
        public class TestScenarioResultCounts
        {
            public string TestScenarioId { get; set; }

            public string TestScenarioName { get; set; }

            public int Passed { get; set; }

            public int Failed { get; set; }

            public int Ignored { get; set; }

            public DateTimeOffset? LastUpdatedDate { get; set; }

            public string LastUpdatedDateDisplay
            {
                get
                {
                    return LastUpdatedDate.HasValue ? LastUpdatedDate.Value.ToString("dd/MM/yyyy HH:mm:ss") : "";
                }
            }
        }
    }
}
