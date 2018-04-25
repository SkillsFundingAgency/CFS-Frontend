using System.Collections.Generic;
using System.Linq;

namespace CalculateFunding.Frontend.Clients.TestEngineClient.Models
{
    public class TestSecenarioResultCountsRequestModel
    {
        public TestSecenarioResultCountsRequestModel()
        {
            TestScenarioIds = Enumerable.Empty<string>();
        }

        public IEnumerable<string> TestScenarioIds { get; set; }
    }
}
