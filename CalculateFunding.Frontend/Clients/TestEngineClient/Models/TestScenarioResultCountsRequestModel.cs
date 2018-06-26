using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.Clients.TestEngineClient.Models
{
    public class TestScenarioResultCountsRequestModel
    {
        public TestScenarioResultCountsRequestModel()
        {
            TestScenarioIds = Enumerable.Empty<string>();
        }

        public IEnumerable<string> TestScenarioIds { get; set; }
    }
}
